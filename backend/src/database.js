// Opens the SQLite database and creates the tables from schema.sql
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// the database is a single file in the backend folder
// (tests can set DB_FILE to ":memory:" so they never touch the real file)
const dbFile = process.env.DB_FILE || path.join(__dirname, "..", "queuesmart.db");
const db = new Database(dbFile);

// SQLite has foreign keys turned off by default, so turn them on
db.pragma("foreign_keys = ON");

// create the tables (IF NOT EXISTS means it is safe to run every time)
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

module.exports = db;