const { calculateWaitTime, getPosition } = require("./waitTime");
const { addHistoryRecord } = require("./history");

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function findService(services, serviceId) {
  for (let i = 0; i < services.length; i++) {
    if (services[i].id === serviceId) {
      return services[i];
    }
  }
  return null;
}

// a person's current queue entry, or null if they are not waiting anywhere
function findActiveEntry(queueEntries, userEmail) {
  for (let i = 0; i < queueEntries.length; i++) {
    if (queueEntries[i].userEmail === userEmail && queueEntries[i].status !== "served") {
      return queueEntries[i];
    }
  }
  return null;
}

function joinQueue(queueEntries, services, request) {
  if (!Array.isArray(queueEntries) || !Array.isArray(services) || !request) {
    throw new Error("Queue entries, services and a request are required");
  }
  if (typeof request.userEmail !== "string" || request.userEmail.trim() === "") {
    throw new Error("User email is required");
  }
  if (request.userEmail.length > 254) {
    throw new Error("User email must be 254 characters or less");
  }
  if (typeof request.visitorName !== "string" || request.visitorName.trim() === "") {
    throw new Error("Visitor name is required");
  }
  if (request.visitorName.length > 100) {
    throw new Error("Visitor name must be 100 characters or less");
  }
  if (typeof request.serviceId !== "number") {
    throw new Error("Service id must be a number");
  }

  const service = findService(services, request.serviceId);
  if (service === null) {
    throw new Error("That service does not exist");
  }
  if (!service.isOpen) {
    throw new Error("That service is closed");
  }
  if (findActiveEntry(queueEntries, request.userEmail) !== null) {
    throw new Error("You are already in a queue");
  }

  // new id = highest existing id + 1
  let highestId = 0;
  for (let i = 0; i < queueEntries.length; i++) {
    if (queueEntries[i].id > highestId) {
      highestId = queueEntries[i].id;
    }
  }

  const entry = {
    id: highestId + 1,
    serviceId: service.id,
    visitorName: request.visitorName,
    userEmail: request.userEmail,
    joinedAt: getNow(),
    status: "waiting"
  };
  queueEntries.push(entry);

  const position = getPosition(queueEntries, entry);
  const estimatedWait = calculateWaitTime(position, service.duration);
  return { entry: entry, position: position, estimatedWait: estimatedWait };
}

function leaveQueue(queueEntries, services, history, userEmail) {
  if (!Array.isArray(queueEntries) || !Array.isArray(services) || !Array.isArray(history)) {
    throw new Error("Queue entries, services and history lists are required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

  const entry = findActiveEntry(queueEntries, userEmail);
  if (entry === null) {
    throw new Error("You are not in a queue");
  }

  const service = findService(services, entry.serviceId);
  const serviceName = service === null ? "Unknown service" : service.name;

  queueEntries.splice(queueEntries.indexOf(entry), 1);
  const record = addHistoryRecord(history, {
    userEmail: userEmail,
    date: getNow().slice(0, 10),
    serviceName: serviceName,
    outcome: "left queue"
  });
  return { removedEntry: entry, historyRecord: record };
}

module.exports = { joinQueue, leaveQueue };