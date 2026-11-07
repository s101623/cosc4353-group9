// use a throwaway database in memory so the tests never touch the real file
process.env.DB_FILE = ":memory:";

const db = require("../src/database");
const { addHistoryRecord, getUserHistory } = require("../src/historyDb");

const goodRecord = {
  userEmail: "visitor@example.com",
  date: "2026-10-01",
  serviceName: "Driver License Renewal",
  outcome: "served"
};

// before every test: empty the tables and add two users
beforeEach(() => {
  db.exec("DELETE FROM History");
  db.exec("DELETE FROM UserCredentials");
  db.exec("DELETE FROM sqlite_sequence");
  const addUser = db.prepare("INSERT INTO UserCredentials (email, password_hash, role) VALUES (?, ?, ?)");
  addUser.run("visitor@example.com", "x", "user");
  addUser.run("other@example.com", "x", "user");
});

test("saves a record in the database and gives it id 1", () => {
  const saved = addHistoryRecord(db, goodRecord);
  expect(saved.id).toBe(1);
  const count = db.prepare("SELECT COUNT(*) AS n FROM History").get().n;
  expect(count).toBe(1);
});

test("the next record gets the next id", () => {
  addHistoryRecord(db, goodRecord);
  expect(addHistoryRecord(db, goodRecord).id).toBe(2);
});

test("rejects a missing email or service name", () => {
  expect(() => addHistoryRecord(db, { ...goodRecord, userEmail: "" })).toThrow("email");
  expect(() => addHistoryRecord(db, { ...goodRecord, serviceName: "" })).toThrow("Service name");
});

test("rejects a service name longer than 100 characters", () => {
  const longName = "a".repeat(101);
  expect(() => addHistoryRecord(db, { ...goodRecord, serviceName: longName })).toThrow("100");
});

test("rejects a bad date or outcome", () => {
  expect(() => addHistoryRecord(db, { ...goodRecord, date: "10/01/2026" })).toThrow("Date");
  expect(() => addHistoryRecord(db, { ...goodRecord, outcome: "cancelled" })).toThrow("Outcome");
});

test("rejects a user that does not exist", () => {
  expect(() => addHistoryRecord(db, { ...goodRecord, userEmail: "nobody@example.com" })).toThrow("does not exist");
});

test("rejects a missing database or record", () => {
  expect(() => addHistoryRecord(null, goodRecord)).toThrow("required");
  expect(() => addHistoryRecord(db)).toThrow("required");
});

test("getUserHistory returns only that user's records, newest first", () => {
  addHistoryRecord(db, { ...goodRecord, date: "2026-09-01" });
  addHistoryRecord(db, { ...goodRecord, userEmail: "other@example.com", date: "2026-09-05" });
  addHistoryRecord(db, { ...goodRecord, date: "2026-10-01", outcome: "no show" });

  const mine = getUserHistory(db, "visitor@example.com");
  expect(mine.length).toBe(2);
  expect(mine[0].date).toBe("2026-10-01");
  expect(mine[1].date).toBe("2026-09-01");
  expect(mine[0].userEmail).toBe("visitor@example.com");
});

test("on the same date the newer record comes first", () => {
  addHistoryRecord(db, { ...goodRecord, outcome: "served" });
  addHistoryRecord(db, { ...goodRecord, outcome: "left queue" });
  const mine = getUserHistory(db, "visitor@example.com");
  expect(mine[0].outcome).toBe("left queue");
});

test("getUserHistory rejects bad input", () => {
  expect(() => getUserHistory(null, "visitor@example.com")).toThrow("database");
  expect(() => getUserHistory(db, "")).toThrow("email");
});

test("the database itself refuses a bad outcome", () => {
  const badInsert = db.prepare(
    "INSERT INTO History (user_id, service_name, date, outcome) VALUES (1, 'x', '2026-10-01', 'cancelled')"
  );
  expect(() => badInsert.run()).toThrow("CHECK constraint failed");
});