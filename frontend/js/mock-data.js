// Mock data for the QueueSmart front end (A2). No backend yet, every screen reads from here.

// available government services
const services = [
    { id: 1, name: "Driver License Renewal", description: "Renew an existing license", duration: 15, priority: "medium", isOpen: true },
    { id: 2, name: "Passport Application", description: "Apply for a new passport", duration: 30, priority: "medium", isOpen: true },
    { id: 3, name: "Passport Renewal or Replacement", description: "Renew or replace an existing passport", duration: 20, priority: "medium", isOpen: true },
    { id: 4, name: "ID Replacement", description: "Replace a lost or damaged identification card", duration: 10, priority: "low", isOpen: true },
    { id: 5, name: "Vehicle Registration", description: "Register or renew registration for a vehicle", duration: 15, priority: "medium", isOpen: true }
];

// status is one of: "waiting", "almost ready", "served"
const queueEntries = [
  { id: 1, serviceId: 1, visitorName: "Alex Visitor", userEmail: "visitor@example.com", joinedAt: "2026-10-01 09:20", status: "waiting" },
  { id: 2, serviceId: 1, visitorName: "Jordan Visitor", userEmail: "visitor2@example.com", joinedAt: "2026-10-01 09:25", status: "waiting" },
  { id: 3, serviceId: 1, visitorName: "Sam Visitor", userEmail: "visitor3@example.com", joinedAt: "2026-10-01 09:30", status: "waiting" }
];

// outcome is one of: "served", "left queue", "no show"
const history = [
  { id: 1, userEmail: "visitor@example.com", date: "2026-09-24", serviceName: "Driver License Renewal", outcome: "served" }
];

// type is "queue update" or "status change"
const notifications = [
  { id: 1, userEmail: "visitor@example.com", type: "queue update", message: "You joined the queue for Driver License Renewal.", time: "2026-10-01 09:20", read: false }
];


const users = [
  { email: "visitor@example.com", password: "Visitor123", name: "Alex Visitor", role: "user" },
  { email: "visitor2@example.com", password: "Visitor456", name: "Jordan Visitor", role: "user" },
  { email: "visitor3@example.com", password: "Visitor789", name: "Sam Visitor", role: "user" },
  { email: "admin@queuesmart.gov", password: "Admin123", name: "Dana Staff", role: "admin" }
];
