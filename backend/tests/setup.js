// Runs before every test file: point the database at memory so tests never touch queuesmart.db
process.env.DB_FILE = ":memory:";
