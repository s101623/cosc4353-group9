const { addNotification, getUserNotifications, notifyJoined, notifyAlmostReady } = require("../src/notifications");

const goodRecord = {
  userEmail: "visitor@example.com",
  type: "queue update",
  message: "You joined the queue for ID Replacement."
};

test("adds a notification with id 1, unread, and a time", () => {
  const list = [];
  const saved = addNotification(list, goodRecord);
  expect(saved.id).toBe(1);
  expect(saved.read).toBe(false);
  expect(typeof saved.time).toBe("string");
  expect(list.length).toBe(1);
});

test("rejects a bad type", () => {
  expect(() => addNotification([], { ...goodRecord, type: "bogus" })).toThrow("Type");
});
test("notifyJoined makes a queue update that names the service", () => {
  const list = [];
  const saved = notifyJoined(list, "visitor@example.com", "ID Replacement");
  expect(saved.type).toBe("queue update");
  expect(saved.message).toContain("ID Replacement");
});

test("rejects a missing email", () => {
  expect(() => addNotification([], { ...goodRecord, userEmail: "" })).toThrow("email");
});
test("rejects an email over 254 characters", () => {
  expect(() => addNotification([], { ...goodRecord, userEmail: "a".repeat(255) })).toThrow("254");
});

test("rejects a missing message", () => {
  expect(() => addNotification([], { ...goodRecord, message: "" })).toThrow("Message");
});
test("rejects a long message", () => {
  expect(() => addNotification([], { ...goodRecord, message: "a".repeat(201) })).toThrow("200");
});
test("rejects an empty service name", () => {
  expect(() => notifyJoined([], "visitor@example.com", "")).toThrow("Service name");
});
test("getUserNotifications returns only mine, newest first", () => {
  const list = [];
  addNotification(list, { ...goodRecord, time: "2026-10-01 09:00" });
  addNotification(list, { ...goodRecord, userEmail: "other@example.com", time: "2026-10-01 09:30" });
  addNotification(list, { ...goodRecord, time: "2026-10-01 09:15" });
  const mine = getUserNotifications(list, "visitor@example.com");
  expect(mine.length).toBe(2);
  expect(mine[0].time).toBe("2026-10-01 09:15");
});