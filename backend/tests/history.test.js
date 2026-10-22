const { addHistoryRecord, getUserHistory } = require("../src/history");

const goodRecord = {
  userEmail: "visitor@example.com",
  date: "2026-10-01",
  serviceName: "Driver License Renewal",
  outcome: "served"
};

test("adds a record and gives it id 1 in an empty list", () => {
  const history = [];
  const saved = addHistoryRecord(history, goodRecord);
  expect(saved.id).toBe(1);
  expect(history.length).toBe(1);
});

test("new id is the highest existing id plus 1", () => {
  const history = [
    { id: 7, userEmail: "a@x.com", date: "2026-09-01", serviceName: "ID Replacement", outcome: "served" }
  ];
  expect(addHistoryRecord(history, goodRecord).id).toBe(8);
});

test("rejects a missing email or service name", () => {
  expect(() => addHistoryRecord([], { ...goodRecord, userEmail: "" })).toThrow("email");
  expect(() => addHistoryRecord([], { ...goodRecord, serviceName: "" })).toThrow("Service name");
});

test("rejects a service name longer than 100 characters", () => {
  const longName = "a".repeat(101);
  expect(() => addHistoryRecord([], { ...goodRecord, serviceName: longName })).toThrow("100");
});

test("rejects a bad date or outcome", () => {
  expect(() => addHistoryRecord([], { ...goodRecord, date: "10/01/2026" })).toThrow("Date");
  expect(() => addHistoryRecord([], { ...goodRecord, outcome: "cancelled" })).toThrow("Outcome");
});

test("rejects a missing history list or record", () => {
  expect(() => addHistoryRecord(null, goodRecord)).toThrow("required");
  expect(() => addHistoryRecord([])).toThrow("required");
});

test("getUserHistory returns only that user's records, newest first", () => {
  const history = [
    { id: 1, userEmail: "a@x.com", date: "2026-09-01", serviceName: "ID Replacement", outcome: "served" },
    { id: 2, userEmail: "b@x.com", date: "2026-09-05", serviceName: "Passport Application", outcome: "left queue" },
    { id: 3, userEmail: "a@x.com", date: "2026-10-01", serviceName: "Vehicle Registration", outcome: "no show" }
  ];
  const mine = getUserHistory(history, "a@x.com");
  expect(mine.length).toBe(2);
  expect(mine[0].id).toBe(3);
  expect(mine[1].id).toBe(1);
});

test("getUserHistory rejects bad input", () => {
  expect(() => getUserHistory(null, "a@x.com")).toThrow("list");
  expect(() => getUserHistory([], "")).toThrow("email");
});