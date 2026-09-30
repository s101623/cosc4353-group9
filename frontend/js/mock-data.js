// Mock data for the QueueSmart front end (A2). No backend yet, every screen reads from here.

const services = [
  { id: 1, name: "Driver License Renewal", description: "Renew an existing license", duration: 15, priority: "medium", isOpen: true }
];

// status is one of: "waiting", "almost ready", "served"
const queueEntries = [
  { id: 1, serviceId: 1, visitorName: "Alex Visitor", userEmail: "visitor@example.com", joinedAt: "2026-10-01 09:20", status: "waiting" }
];

// outcome is one of: "served", "left queue", "no show"
const history = [
  { id: 1, userEmail: "visitor@example.com", date: "2026-09-24", serviceName: "Driver License Renewal", outcome: "served" }
];

// type is "queue update" or "status change"
const notifications = [
  { id: 1, userEmail: "visitor@example.com", type: "queue update", message: "You joined the queue for Driver License Renewal.", time: "2026-10-01 09:20", read: false }
];

// Mock accounts only. Staff accounts are created by an admin invite, visitors register themselves.
const users = [
  { email: "visitor@example.com", password: "Visitor123", name: "Alex Visitor", role: "user" },
  { email: "admin@queuesmart.gov", password: "Admin123", name: "Dana Staff", role: "admin" }
];
