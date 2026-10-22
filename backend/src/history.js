const OUTCOMES = ["served", "left queue", "no show"];

function addHistoryRecord(history, record) {
  if (!Array.isArray(history) || !record) {
    throw new Error("A history list and a record are required");
  }
  if (typeof record.userEmail !== "string" || record.userEmail.trim() === "") {
    throw new Error("User email is required");
  }
  if (typeof record.serviceName !== "string" || record.serviceName.trim() === "") {
    throw new Error("Service name is required");
  }
  if (record.serviceName.length > 100) {
    throw new Error("Service name must be 100 characters or less");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    throw new Error("Date must look like 2026-10-01");
  }
  if (!OUTCOMES.includes(record.outcome)) {
    throw new Error("Outcome must be served, left queue, or no show");
  }

  // new id = highest existing id + 1, so ids never repeat
  let highestId = 0;
  for (let i = 0; i < history.length; i++) {
    if (history[i].id > highestId) {
      highestId = history[i].id;
    }
  }

  const newRecord = {
    id: highestId + 1,
    userEmail: record.userEmail,
    date: record.date,
    serviceName: record.serviceName,
    outcome: record.outcome
  };
  history.push(newRecord);
  return newRecord;
}

// newest first, like the History screen
function getUserHistory(history, userEmail) {
  if (!Array.isArray(history)) {
    throw new Error("A history list is required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

  const mine = history.filter(function (record) {
    return record.userEmail === userEmail;
  });
  mine.sort(function (a, b) {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return b.id - a.id;
  });
  return mine;
}

module.exports = { addHistoryRecord, getUserHistory };