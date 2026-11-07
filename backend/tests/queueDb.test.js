const db = require("../src/database");
const { reset } = require("../src/seed");
const { joinQueue, leaveQueue, getQueuePosition } = require("../src/queueDb");

// before every test: put Mustafa's starting records back
// (Alex, Jordan and Sam waiting for service 1, nobody waiting for services 2 to 5)
beforeEach(() => {
  reset();
});

const admin = "admin@queuesmart.gov";
const alex = "visitor@example.com";

test("joining an empty queue gives position 1 and one duration of wait", () => {
  const result = joinQueue(db, { userEmail: admin, serviceId: 2 });
  expect(result.position).toBe(1);
  expect(result.estimatedWait).toBe(30);
  expect(result.entry.status).toBe("waiting");
  expect(result.entry.visitorName).toBe("Dana Staff");
});

test("joining behind three people gives position 4 and 60 minutes", () => {
  const result = joinQueue(db, { userEmail: admin, serviceId: 1 });
  expect(result.position).toBe(4);
  expect(result.estimatedWait).toBe(60);
});

test("the new entry is saved in the QueueEntry table", () => {
  joinQueue(db, { userEmail: admin, serviceId: 1 });
  const count = db.prepare("SELECT COUNT(*) AS n FROM QueueEntry WHERE status = 'waiting'").get().n;
  expect(count).toBe(4);
});

test("opens a queue for a service that does not have one yet", () => {
  db.prepare("DELETE FROM Queue WHERE service_id = 3").run();
  const result = joinQueue(db, { userEmail: admin, serviceId: 3 });
  expect(result.position).toBe(1);
  const queues = db.prepare("SELECT COUNT(*) AS n FROM Queue WHERE service_id = 3").get().n;
  expect(queues).toBe(1);
});

test("rejects a user who is already in a queue", () => {
  expect(() => joinQueue(db, { userEmail: alex, serviceId: 2 })).toThrow("already in a queue");
});

test("allows joining again after leaving", () => {
  leaveQueue(db, alex);
  const result = joinQueue(db, { userEmail: alex, serviceId: 2 });
  expect(result.position).toBe(1);
});

test("rejects a service that does not exist or is closed", () => {
  expect(() => joinQueue(db, { userEmail: admin, serviceId: 99 })).toThrow("does not exist");
  db.prepare("UPDATE Service SET is_open = 0 WHERE id = 2").run();
  expect(() => joinQueue(db, { userEmail: admin, serviceId: 2 })).toThrow("closed");
});

test("rejects a user that does not exist", () => {
  expect(() => joinQueue(db, { userEmail: "nobody@example.com", serviceId: 2 })).toThrow("does not exist");
});

test("rejects missing or bad fields", () => {
  expect(() => joinQueue(db, { userEmail: "", serviceId: 2 })).toThrow("email");
  expect(() => joinQueue(db, { userEmail: admin, serviceId: "2" })).toThrow("number");
  expect(() => joinQueue(db, { userEmail: "a".repeat(255), serviceId: 2 })).toThrow("254");
  expect(() => joinQueue(db)).toThrow("required");
  expect(() => joinQueue(null, { userEmail: admin, serviceId: 2 })).toThrow("required");
});

test("leaving marks the entry canceled and records it in history", () => {
  const result = leaveQueue(db, alex);
  expect(result.removedEntry.status).toBe("canceled");
  expect(result.historyRecord.outcome).toBe("left queue");
  expect(result.historyRecord.serviceName).toBe("Driver License Renewal");

  const status = db.prepare("SELECT status FROM QueueEntry WHERE id = 1").get().status;
  expect(status).toBe("canceled");
  const outcome = db.prepare("SELECT outcome FROM History WHERE user_id = 1 ORDER BY id DESC").get().outcome;
  expect(outcome).toBe("left queue");
});

test("people behind move up when someone leaves", () => {
  leaveQueue(db, alex);
  expect(getQueuePosition(db, 2)).toBe(1);
  expect(getQueuePosition(db, 3)).toBe(2);
});

test("rejects leaving when the user is not in a queue", () => {
  expect(() => leaveQueue(db, admin)).toThrow("not in a queue");
  expect(() => leaveQueue(db, "nobody@example.com")).toThrow("not in a queue");
});

test("leaveQueue rejects bad input", () => {
  expect(() => leaveQueue(null, alex)).toThrow("database");
  expect(() => leaveQueue(db, "")).toThrow("email");
});

test("getQueuePosition gives each person their place", () => {
  expect(getQueuePosition(db, 1)).toBe(1);
  expect(getQueuePosition(db, 2)).toBe(2);
  expect(getQueuePosition(db, 3)).toBe(3);
  expect(() => getQueuePosition(db, 99)).toThrow("does not exist");
});

test("the database refuses an entry with a bad status", () => {
  const badInsert = db.prepare(
    "INSERT INTO QueueEntry (queue_id, user_id, position, status) VALUES (1, 1, 1, 'almost ready')"
  );
  expect(() => badInsert.run()).toThrow("CHECK constraint failed");
});