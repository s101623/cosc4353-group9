const TYPES = ["queue update", "status change"];

function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function addNotification(notifications, record) {
  if (!Array.isArray(notifications) || !record) {
    throw new Error("A notifications list and a record are required");
  }
  if (typeof record.userEmail !== "string" || record.userEmail.trim() === "") {
    throw new Error("User email is required");
  }
  if (record.userEmail.length > 254) {
    throw new Error("User email must be 254 characters or less");
  }
  if (!TYPES.includes(record.type)) {
    throw new Error("Type must be queue update or status change");
  }
  if (typeof record.message !== "string" || record.message.trim() === "") {
    throw new Error("Message is required");
  }
  if (record.message.length > 200) {
    throw new Error("Message must be 200 characters or less");
  }

  let highestId = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].id > highestId) {
      highestId = notifications[i].id;
    }
  }

  const newRecord = {
    id: highestId + 1,
    userEmail: record.userEmail,
    type: record.type,
    message: record.message,
    time: record.time || getNow(),
    read: false
  };
  notifications.push(newRecord);
  return newRecord;
}
// newest first
function getUserNotifications(notifications, userEmail) {
  if (!Array.isArray(notifications)) {
    throw new Error("A notifications list is required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

 const mine = notifications.filter(function (record) {
    return record.userEmail === userEmail;
  });
  mine.sort(function (a, b) {
    if (a.time < b.time) return 1;
    if (a.time > b.time) return -1;
    return b.id - a.id;
  });
  return mine;
}

function notifyJoined(notifications, userEmail, serviceName) {
  if (typeof serviceName !== "string" || serviceName.trim() === "") {
    throw new Error("Service name is required");
  }
  return addNotification(notifications, {
    userEmail: userEmail,
    type: "queue update",
    message: "You joined the queue for " + serviceName + "."
  });
}

function notifyAlmostReady(notifications, userEmail, serviceName) {
  if (typeof serviceName !== "string" || serviceName.trim() === "") {
    throw new Error("Service name is required");
  }
  return addNotification(notifications, {
    userEmail: userEmail,
    type: "status change",
    message: "Almost ready. You are next for " + serviceName + "."
  });
}
module.exports = { addNotification, getUserNotifications, notifyJoined, notifyAlmostReady };