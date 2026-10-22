const { joinQueue, leaveQueue } = require("../src/queue");

function makeServices() {
  return [
    { id: 1, name: "Driver License Renewal", description: "Renew an existing license", duration: 15, priority: "medium", isOpen: true },
    { id: 2, name: "Passport Application", description: "Apply for a new passport", duration: 30, priority: "medium", isOpen: false }
  ];
}

const request = { userEmail: "visitor@example.com", visitorName: "Alex Visitor", serviceId: 1 };

test("joining an empty queue gives position 1 and one duration of wait", () => {
  const queue = [];
  const result = joinQueue(queue, makeServices(), request);
  expect(result.position).toBe(1);
  expect(result.estimatedWait).toBe(15);
  expect(result.entry.status).toBe("waiting");
  expect(queue.length).toBe(1);
});

test("joining behind two people gives position 3 and 45 minutes", () => {
  const queue = [
    { id: 1, serviceId: 1, visitorName: "A", userEmail: "a@x.com", joinedAt: "2020-01-01 09:20", status: "waiting" },
    { id: 2, serviceId: 1, visitorName: "B", userEmail: "b@x.com", joinedAt: "2020-01-01 09:25", status: "waiting" }
  ];
  const result = joinQueue(queue, makeServices(), request);
  expect(result.position).toBe(3);
  expect(result.estimatedWait).toBe(45);
  expect(result.entry.id).toBe(3);
});

test("rejects a user who is already in a queue", () => {
  const queue = [];
  joinQueue(queue, makeServices(), request);
  expect(() => joinQueue(queue, makeServices(), request)).toThrow("already in a queue");
});

test("allows joining again after being served", () => {
  const queue = [
    { id: 1, serviceId: 1, visitorName: "Alex Visitor", userEmail: "visitor@example.com", joinedAt: "2020-01-01 09:20", status: "served" }
  ];
  const result = joinQueue(queue, makeServices(), request);
  expect(result.position).toBe(1);
});

test("rejects a service that does not exist or is closed", () => {
  expect(() => joinQueue([], makeServices(), { ...request, serviceId: 99 })).toThrow("does not exist");
  expect(() => joinQueue([], makeServices(), { ...request, serviceId: 2 })).toThrow("closed");
});

test("rejects missing or bad fields", () => {
  expect(() => joinQueue([], makeServices(), { ...request, userEmail: "" })).toThrow("email");
  expect(() => joinQueue([], makeServices(), { ...request, visitorName: "" })).toThrow("Visitor name");
  expect(() => joinQueue([], makeServices(), { ...request, serviceId: "1" })).toThrow("number");
  expect(() => joinQueue([], makeServices(), { ...request, visitorName: "a".repeat(101) })).toThrow("100");
  expect(() => joinQueue([], makeServices())).toThrow("required");
});

test("leaving removes the entry and records it in history", () => {
  const queue = [];
  const history = [];
  joinQueue(queue, makeServices(), request);
  const result = leaveQueue(queue, makeServices(), history, "visitor@example.com");
  expect(queue.length).toBe(0);
  expect(history.length).toBe(1);
  expect(result.historyRecord.outcome).toBe("left queue");
  expect(result.historyRecord.serviceName).toBe("Driver License Renewal");
});

test("leaving does not remove other people", () => {
  const queue = [
    { id: 1, serviceId: 1, visitorName: "A", userEmail: "a@x.com", joinedAt: "2020-01-01 09:20", status: "waiting" }
  ];
  const history = [];
  joinQueue(queue, makeServices(), request);
  leaveQueue(queue, makeServices(), history, "visitor@example.com");
  expect(queue.length).toBe(1);
  expect(queue[0].userEmail).toBe("a@x.com");
});

test("rejects leaving when not in a queue", () => {
  expect(() => leaveQueue([], makeServices(), [], "visitor@example.com")).toThrow("not in a queue");
});

test("leaveQueue rejects bad input", () => {
  expect(() => leaveQueue(null, makeServices(), [], "visitor@example.com")).toThrow("required");
  expect(() => leaveQueue([], makeServices(), [], "")).toThrow("email");
});