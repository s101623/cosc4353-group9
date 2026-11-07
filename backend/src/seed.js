// Starting records for an empty database: the same services and test accounts the
// front end's mock-data.js had, so the screens look the same as in A2 and A3.
const db = require("./database");
const { hashPassword } = require("./auth");

// one hash shared by the seeded accounts (hashing is slow and tests reset the data often)
const SEED_PASSWORD = "password123!";
const seedHash = hashPassword(SEED_PASSWORD);

const USERS = [
  { email: "visitor@example.com", name: "Alex Visitor", role: "user" },
  { email: "visitor2@example.com", name: "Jordan Visitor", role: "user" },
  { email: "visitor3@example.com", name: "Sam Visitor", role: "user" },
  { email: "admin@queuesmart.gov", name: "Dana Staff", role: "admin" }
];

const SERVICES = [
  ["Driver License Renewal", "Renew an existing license", 15, "medium"],
  ["Passport Application", "Apply for a new passport", 30, "medium"],
  ["Passport Renewal or Replacement", "Renew or replace an existing passport", 20, "medium"],
  ["ID Replacement", "Replace a lost or damaged identification card", 10, "low"],
  ["Vehicle Registration", "Register or renew registration for a vehicle", 15, "medium"]
];

// three visitors waiting for service 1, in the order they joined
const QUEUE_ENTRIES = [
  ["visitor@example.com", "2026-10-01 09:20"],
  ["visitor2@example.com", "2026-10-01 09:25"],
  ["visitor3@example.com", "2026-10-01 09:30"]
];

const seedAll = db.transaction(function () {
  const insertUser = db.prepare("INSERT INTO UserCredentials (email, password_hash, role) VALUES (?, ?, ?)");
  const insertProfile = db.prepare("INSERT INTO UserProfile (user_id, full_name) VALUES (?, ?)");
  const userIds = {};
  USERS.forEach(function (user) {
    const info = insertUser.run(user.email, seedHash, user.role);
    insertProfile.run(info.lastInsertRowid, user.name);
    userIds[user.email] = info.lastInsertRowid;
  });

  const insertService = db.prepare("INSERT INTO Service (name, description, duration, priority) VALUES (?, ?, ?, ?)");
  const insertQueue = db.prepare("INSERT INTO Queue (service_id) VALUES (?)");
  SERVICES.forEach(function (service) {
    const info = insertService.run(service[0], service[1], service[2], service[3]);
    insertQueue.run(info.lastInsertRowid);
  });

  const queueOne = db.prepare("SELECT id FROM Queue WHERE service_id = 1").get().id;
  const insertEntry = db.prepare("INSERT INTO QueueEntry (queue_id, user_id, position, join_time) VALUES (?, ?, ?, ?)");
  QUEUE_ENTRIES.forEach(function (entry, index) {
    insertEntry.run(queueOne, userIds[entry[0]], index + 1, entry[1]);
  });

  db.prepare("INSERT INTO History (user_id, service_name, date, outcome) VALUES (?, ?, ?, ?)")
    .run(userIds["visitor@example.com"], "Driver License Renewal", "2026-09-24", "served");
  db.prepare("INSERT INTO Notification (user_id, type, message, time) VALUES (?, ?, ?, ?)")
    .run(userIds["visitor@example.com"], "queue update", "You joined the queue for Driver License Renewal.", "2026-10-01 09:20");
});

// fills the tables only when they are empty, so restarting the server keeps real data
function seed() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM UserCredentials").get().n;
  if (count > 0) {
    return false;
  }
  seedAll();
  return true;
}

// empties every table and seeds again. Tests call this so they do not affect each other.
const reset = db.transaction(function () {
  ["Notification", "History", "QueueEntry", "Queue", "Service", "UserProfile", "UserCredentials"]
    .forEach(function (table) {
      db.prepare("DELETE FROM " + table).run();
    });
  db.prepare("DELETE FROM sqlite_sequence").run();
  seedAll();
});

module.exports = { seed, reset, SEED_PASSWORD };
