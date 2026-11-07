// Queue module, database version (join and leave).
const { calculateWaitTime } = require("./waitTime");
const { addHistoryRecord } = require("./historyDb");
const { findUserId } = require("./dbHelpers");

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

// a person's current queue entry, or null if they are not waiting anywhere
function findActiveEntry(db, userId) {
  const row = db
    .prepare(
      "SELECT qe.id, qe.queue_id, qe.join_time, qe.status, q.service_id " +
      "FROM QueueEntry qe JOIN Queue q ON q.id = qe.queue_id " +
      "WHERE qe.user_id = ? AND qe.status = 'waiting'"
    )
    .get(userId);
  return row === undefined ? null : row;
}

// position in line = how many people are waiting ahead of this entry, plus 1
function getQueuePosition(db, entryId) {
  const entry = db.prepare("SELECT id, queue_id, join_time FROM QueueEntry WHERE id = ?").get(entryId);
  if (entry === undefined) {
    throw new Error("That queue entry does not exist");
  }
  const ahead = db
    .prepare(
      "SELECT COUNT(*) AS n FROM QueueEntry WHERE queue_id = ? AND status = 'waiting' " +
      "AND (join_time < ? OR (join_time = ? AND id < ?))"
    )
    .get(entry.queue_id, entry.join_time, entry.join_time, entry.id).n;
  return ahead + 1;
}

function joinQueue(db, request) {
  if (!db || !request) {
    throw new Error("A database and a request are required");
  }
  if (typeof request.userEmail !== "string" || request.userEmail.trim() === "") {
    throw new Error("User email is required");
  }
  if (request.userEmail.length > 254) {
    throw new Error("User email must be 254 characters or less");
  }
  if (typeof request.serviceId !== "number") {
    throw new Error("Service id must be a number");
  }

  const service = db.prepare("SELECT id, name, duration, is_open FROM Service WHERE id = ?").get(request.serviceId);
  if (service === undefined) {
    throw new Error("That service does not exist");
  }
  if (service.is_open === 0) {
    throw new Error("That service is closed");
  }

  const userId = findUserId(db, request.userEmail);
  if (userId === null) {
    throw new Error("That user does not exist");
  }
  if (findActiveEntry(db, userId) !== null) {
    throw new Error("You are already in a queue");
  }

  // use the service's open queue, or open one if it does not have one yet
  let queue = db.prepare("SELECT id FROM Queue WHERE service_id = ? AND status = 'open'").get(service.id);
  if (queue === undefined) {
    const made = db.prepare("INSERT INTO Queue (service_id) VALUES (?)").run(service.id);
    queue = { id: Number(made.lastInsertRowid) };
  }

  const waitingNow = db
    .prepare("SELECT COUNT(*) AS n FROM QueueEntry WHERE queue_id = ? AND status = 'waiting'")
    .get(queue.id).n;
  const joinedAt = getNow();
  const info = db
    .prepare("INSERT INTO QueueEntry (queue_id, user_id, position, join_time) VALUES (?, ?, ?, ?)")
    .run(queue.id, userId, waitingNow + 1, joinedAt);
  const entryId = Number(info.lastInsertRowid);

  const position = getQueuePosition(db, entryId);
  const profile = db.prepare("SELECT full_name FROM UserProfile WHERE user_id = ?").get(userId);

  const entry = {
    id: entryId,
    serviceId: service.id,
    visitorName: profile === undefined ? request.userEmail : profile.full_name,
    userEmail: request.userEmail,
    joinedAt: joinedAt,
    status: "waiting"
  };
  return { entry: entry, position: position, estimatedWait: calculateWaitTime(position, service.duration) };
}

function leaveQueue(db, userEmail) {
  if (!db) {
    throw new Error("A database is required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

  const userId = findUserId(db, userEmail);
  const entry = userId === null ? null : findActiveEntry(db, userId);
  if (entry === null) {
    throw new Error("You are not in a queue");
  }

  const service = db.prepare("SELECT name FROM Service WHERE id = ?").get(entry.service_id);
  const serviceName = service === undefined ? "Unknown service" : service.name;

  // both changes happen together, or neither happens
  const leave = db.transaction(function () {
    db.prepare("UPDATE QueueEntry SET status = 'canceled' WHERE id = ?").run(entry.id);
    return addHistoryRecord(db, {
      userEmail: userEmail,
      date: getNow().slice(0, 10),
      serviceName: serviceName,
      outcome: "left queue"
    });
  });
  const record = leave();

  const removedEntry = {
    id: entry.id,
    serviceId: entry.service_id,
    userEmail: userEmail,
    joinedAt: entry.join_time,
    status: "canceled"
  };
  return { removedEntry: removedEntry, historyRecord: record };
}

module.exports = { joinQueue, leaveQueue, getQueuePosition };