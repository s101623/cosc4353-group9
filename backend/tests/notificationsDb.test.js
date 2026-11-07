const db = require("../src/database");
const { reset } = require("../src/seed");
const { addNotification, getUserNotifications, notifyJoined, notifyAlmostReady } = require("../src/notificationsDb");

// before every test: put the starting records back (one notification already exists for visitor@example.com)
beforeEach(() => {
  reset();
});

const goodRecord = {
  userEmail: "visitor2@example.com",
  type: "queue update",
  message: "You joined the queue for ID Replacement."
};

test("saves a notification in the database with the next id and unread", () => {
  const saved = addNotification(db, goodRecord);
  expect(saved.id).toBe(2);
  expect(saved.read).toBe(false);
  const count = db.prepare("SELECT COUNT(*) AS n FROM Notification").get().n;
  expect(count).toBe(2);
});



test("rejects a user that does not exist", () => {  expect(() => addNotification(db, { ...goodRecord, userEmail: "nobody@example.com" })).toThrow("does not exist");
});

test("returns only that user's notifications, newest first", () => {

    
  addNotification(db, { ...goodRecord, time: "2026-11-01 09:00" });
  addNotification(db, { ...goodRecord, time: "2026-11-02 09:00" });
  const mine = getUserNotifications(db, "visitor2@example.com");
  expect(mine.length).toBe(2);
  expect(mine[0].time).toBe("2026-11-02 09:00");
  expect(getUserNotifications(db, "visitor3@example.com")).toEqual([]);

});

test("the database itself refuses a message over 200 characters", () => {
  const badInsert = db.prepare("INSERT INTO Notification (user_id, type, message) VALUES (1, 'queue update', ?)");
  expect(() => badInsert.run("x".repeat(201))).toThrow("CHECK constraint failed");
});