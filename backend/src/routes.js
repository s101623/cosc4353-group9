// API routes. Each handler calls a module function and turns its result (or thrown Error)
// into an HTTP response. Business rules live in the module files, not here.
const express = require("express");
const db = require("./data");
const { joinQueue, leaveQueue } = require("./queue");
const { calculateWaitTime, getPosition } = require("./waitTime");
const { getUserHistory } = require("./history");

const router = express.Router();

// Module functions throw plain Errors. "Not found" style messages become 404, everything else 400.
function sendError(res, err) {
  const notFound = /does not exist|not in a queue|not found/i.test(err.message);
  res.status(notFound ? 404 : 400).json({ error: err.message });
}

function findService(serviceId) {
  return db.services.find(function (s) { return s.id === serviceId; }) || null;
}

router.get("/health", function (req, res) {
  res.json({ status: "ok" });
});

// Services (read-only here; create/update belong to the service management module)
router.get("/services", function (req, res) {
  res.json(db.services);
});

// Current queue for one service, in serving order, with each person's position
router.get("/queues/:serviceId", function (req, res) {
  const serviceId = Number(req.params.serviceId);
  const service = findService(serviceId);
  if (!service) {
    return res.status(404).json({ error: "That service does not exist" });
  }
  const waiting = db.queueEntries
    .filter(function (e) { return e.serviceId === serviceId && e.status !== "served"; })
    .map(function (e) {
      return Object.assign({}, e, { position: getPosition(db.queueEntries, e) });
    })
    .sort(function (a, b) { return a.position - b.position; });
  res.json({ service: service, entries: waiting });
});

router.post("/queues/join", function (req, res) {
  try {
    const result = joinQueue(db.queueEntries, db.services, req.body);
    res.status(201).json(result);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/queues/leave", function (req, res) {
  try {
    const result = leaveQueue(db.queueEntries, db.services, db.history, req.body.userEmail);
    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
});

// What the Queue Status screen shows for one visitor
router.get("/queues/status/:email", function (req, res) {
  const entry = db.queueEntries.find(function (e) {
    return e.userEmail === req.params.email && e.status !== "served";
  });
  if (!entry) {
    return res.status(404).json({ error: "You are not in a queue right now" });
  }
  const service = findService(entry.serviceId);
  const position = getPosition(db.queueEntries, entry);
  res.json({
    serviceName: service ? service.name : "Unknown service",
    position: position,
    estimatedWait: service ? calculateWaitTime(position, service.duration) : null,
    status: entry.status
  });
});

router.get("/history/:email", function (req, res) {
  try {
    res.json(getUserHistory(db.history, req.params.email));
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
