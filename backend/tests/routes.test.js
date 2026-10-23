const request = require("supertest");
const app = require("../server");
const db = require("../src/data");

beforeEach(() => {
  db.reset();
});

test("GET /api/health answers ok", async () => {
  const res = await request(app).get("/api/health");
  expect(res.status).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("GET /api/services lists the seeded services", async () => {
  const res = await request(app).get("/api/services");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(5);
  expect(res.body[0].name).toBe("Driver License Renewal");
});

test("POST /api/services creates a service", async () => {
  const body = {
    name: "New Service",
    description: "Test service",
    duration: 20,
    priority: "medium"
  };

  const res = await request(app).post("/api/services").send(body);

  expect(res.status).toBe(201);
  expect(res.body.name).toBe("New Service");
  expect(db.services.length).toBe(6);
});

test("PUT /api/services/:id updates a service", async () => {
  const res = await request(app).put("/api/services/1").send({
    duration: 25,
    priority: "high"
  });

  expect(res.status).toBe(200);
  expect(res.body.duration).toBe(25);
  expect(res.body.priority).toBe("high");
});

test("POST /api/services rejects invalid service data", async () => {
  const res = await request(app).post("/api/services").send({
    name: "",
    description: "Bad service",
    duration: 10,
    priority: "low"
  });

  expect(res.status).toBe(400);
});

test("GET /api/queues/:serviceId returns the queue in order with positions", async () => {
  const res = await request(app).get("/api/queues/1");
  expect(res.status).toBe(200);
  expect(res.body.entries.map((e) => e.position)).toEqual([1, 2, 3]);
  expect(res.body.entries[0].visitorName).toBe("Alex Visitor");
});

test("POST /api/queues/:serviceId/serve-next serves the first visitor", async () => {
  const res = await request(app).post("/api/queues/1/serve-next");

  expect(res.status).toBe(200);
  expect(res.body.visitorName).toBe("Alex Visitor");
  expect(res.body.status).toBe("served");
});

test("GET /api/queues/:serviceId is 404 for an unknown service", async () => {
  const res = await request(app).get("/api/queues/99");
  expect(res.status).toBe(404);
  expect(res.body.error).toMatch(/does not exist/);
});

test("GET /api/queues/status/:email shows position, wait and status", async () => {
  const res = await request(app).get("/api/queues/status/visitor3@example.com");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ serviceName: "Driver License Renewal", position: 3, estimatedWait: 45, status: "waiting" });
});

test("GET /api/queues/status/:email is 404 when the visitor is not in a queue", async () => {
  const res = await request(app).get("/api/queues/status/nobody@example.com");
  expect(res.status).toBe(404);
});

test("POST /api/queues/join adds a visitor and answers 201", async () => {
  const body = { userEmail: "new@example.com", visitorName: "New Visitor", serviceId: 4 };
  const res = await request(app).post("/api/queues/join").send(body);
  expect(res.status).toBe(201);
  expect(res.body.position).toBe(1);
  expect(res.body.estimatedWait).toBe(10);
  expect(db.queueEntries.length).toBe(4);
});

test("POST /api/queues/join rejects bad input with 400", async () => {
  const res = await request(app).post("/api/queues/join").send({ userEmail: "", visitorName: "X", serviceId: 1 });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/email/);
});

test("POST /api/queues/leave removes the visitor and writes history", async () => {
  const res = await request(app).post("/api/queues/leave").send({ userEmail: "visitor2@example.com" });
  expect(res.status).toBe(200);
  expect(res.body.historyRecord.outcome).toBe("left queue");
  expect(db.queueEntries.length).toBe(2);
});

test("POST /api/queues/leave is 404 when not in a queue", async () => {
  const res = await request(app).post("/api/queues/leave").send({ userEmail: "nobody@example.com" });
  expect(res.status).toBe(404);
});

test("GET /api/history/:email returns that visitor's records", async () => {
  const res = await request(app).get("/api/history/visitor@example.com");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].outcome).toBe("served");
});
