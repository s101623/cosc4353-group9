// History module, database version.
// Same rules as history.js, but the records are stored in the History table.
const { validateHistoryRecord } = require("./history");
const { findUserId } = require("./dbHelpers");

function addHistoryRecord(db, record) {
  if (!db || !record) {
    throw new Error("A database and a record are required");
  }
  validateHistoryRecord(record);

  const userId = findUserId(db, record.userEmail);
  if (userId === null) {
    throw new Error("That user does not exist");
  }

  const result = db
    .prepare("INSERT INTO History (user_id, service_name, date, outcome) VALUES (?, ?, ?, ?)")
    .run(userId, record.serviceName, record.date, record.outcome);

  return {
    id: Number(result.lastInsertRowid),
    userEmail: record.userEmail,
    date: record.date,
    serviceName: record.serviceName,
    outcome: record.outcome
  };
}

// newest first, like the History screen
function getUserHistory(db, userEmail) {
  if (!db) {
    throw new Error("A database is required");
  }
  if (typeof userEmail !== "string" || userEmail.trim() === "") {
    throw new Error("User email is required");
  }

  return db
    .prepare(
      "SELECT h.id, u.email AS userEmail, h.date, h.service_name AS serviceName, h.outcome " +
      "FROM History h JOIN UserCredentials u ON u.id = h.user_id " +
      "WHERE u.email = ? ORDER BY h.date DESC, h.id DESC"
    )
    .all(userEmail);
}

module.exports = { addHistoryRecord, getUserHistory };