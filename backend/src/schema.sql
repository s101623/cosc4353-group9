-- QueueSmart database schema (SQLite)

CREATE TABLE IF NOT EXISTS UserCredentials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE CHECK (length(email) <= 254),
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('user', 'admin'))
);

CREATE TABLE IF NOT EXISTS UserProfile (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL UNIQUE REFERENCES UserCredentials(id),
  full_name       TEXT    NOT NULL CHECK (length(full_name) <= 100),
  phone           TEXT    CHECK (length(phone) <= 20),
  date_of_birth   TEXT,
  drivers_license TEXT    UNIQUE
);

CREATE TABLE IF NOT EXISTS Service (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE CHECK (length(name) <= 100),
  description TEXT    NOT NULL CHECK (length(description) <= 500),
  duration    INTEGER NOT NULL CHECK (duration >= 1),
  priority    TEXT    NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  is_open     INTEGER NOT NULL DEFAULT 1 CHECK (is_open IN (0, 1))
);

CREATE TABLE IF NOT EXISTS Queue (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id   INTEGER NOT NULL REFERENCES Service(id),
  status       TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_date TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS QueueEntry (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id  INTEGER NOT NULL REFERENCES Queue(id),
  user_id   INTEGER NOT NULL REFERENCES UserCredentials(id),
  position  INTEGER NOT NULL CHECK (position >= 1),
  join_time TEXT    NOT NULL DEFAULT (datetime('now')),
  status    TEXT    NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'served', 'canceled'))
);

CREATE TABLE IF NOT EXISTS Notification (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES UserCredentials(id),
  type    TEXT    NOT NULL CHECK (type IN ('queue update', 'status change')),
  message TEXT    NOT NULL CHECK (length(message) <= 200),
  time    TEXT    NOT NULL DEFAULT (datetime('now')),
  status  TEXT    NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'viewed'))
);

CREATE TABLE IF NOT EXISTS History (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES UserCredentials(id),
  service_name TEXT    NOT NULL CHECK (length(service_name) <= 100),
  date         TEXT    NOT NULL,
  outcome      TEXT    NOT NULL CHECK (outcome IN ('served', 'left queue', 'no show'))
);