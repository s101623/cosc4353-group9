	// Notification module, database version.
// Same rules as notifications.js, but the records are stored in the Notification table.
const { validateNotification, getNow } = require("./notifications");
const { findUserId } = require("./dbHelpers");

function addNotification(db, record) {
  if (!db || !record) {
    throw new Error("A database and a record are required");
  }
  validateNotification(record);

  const userId = findUserId(db, record.userEmail);
  if (userId === null) {
    throw new Error("That user does not exist");
  }

  const time = record.time || getNow();
  const result = db
    .prepare("INSERT INTO Notification (user_id, type, message, time) VALUES (?, ?, ?, ?)")
    .run(userId, record.type, record.message, time);

  return {
    id: Number(result.lastInsertRowid),
    userEmail: record.userEmail,
    type: record.type,
    message: record.message,
    time: time,
    read: false
  };
}

// newest first
function getUserNotifications(db, userEmail) {
  if (!db) {
    throw new Error("A database is required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

  return db
    .prepare(
      "SELECT n.id, u.email AS userEmail, n.type, n.message, n.time, n.status " +
      "FROM Notification n JOIN UserCredentials u ON u.id = n.user_id " +
      "WHERE u.email = ? ORDER BY n.time DESC, n.id DESC"
    )
    .all(userEmail)
    .map(function (row) {
      return Object.assign({}, row, { read: row.status === "viewed" });
    });
}
function notifyJoined(db, userEmail, serviceName) {
  if (typeof serviceName !== "string" || serviceName.trim() === "") {
    throw new Error("Service name is required");
  }
  return addNotification(db, {
    userEmail: userEmail,
    type: "queue update",
    message: "You joined the queue for " + serviceName + "."
  });
}

function notifyAlmostReady(db, userEmail, serviceName) {
  if (typeof serviceName !== "string" || serviceName.trim() === "") {
    throw new Error("Service name is required");
  }
  return addNotification(db, {
    userEmail: userEmail,
    type: "status change",
    message: "Almost ready. You are next for " + serviceName + "."
  });
}
module.exports = { addNotification, getUserNotifications, notifyJoined, notifyAlmostReady };