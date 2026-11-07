const db = require("../src/database");
const { reset } = require("../src/seed");
const { registerUser } = require("../src/authDb");

// before every test: put the starting records back (4 users)
beforeEach(() => {
  reset();
});

const goodInput = {
  firstName: "Sam",
  middleName: "",
  lastName: "Rivera",
  dob: "2000-01-31",
  license: "12345678",
  email: "sam.rivera@example.com",
  password: "Passw0rd!"
};

test("registers a visitor in the database and returns them without the password", () => {
  const result = registerUser(db, goodInput);
  expect(result.name).toBe("Sam Rivera");
  expect(result.role).toBe("user");
  expect(result.passwordHash).toBeUndefined();

  const row = db.prepare("SELECT * FROM UserCredentials WHERE email = ?").get("sam.rivera@example.com");
  expect(row.role).toBe("user");
  const profile = db.prepare("SELECT * FROM UserProfile WHERE user_id = ?").get(row.id);
  expect(profile.full_name).toBe("Sam Rivera");
  expect(profile.drivers_license).toBe("12345678");
});

test("the password is stored hashed, never as plain text", () => {
  registerUser(db, goodInput);
  const row = db.prepare("SELECT password_hash FROM UserCredentials WHERE email = ?").get("sam.rivera@example.com");
  expect(row.password_hash).not.toBe("Passw0rd!");
  expect(row.password_hash).toContain(":");
});

test("the email is saved in lower case", () => {
  registerUser(db, { ...goodInput, email: " Sam.Rivera@Example.com " });
  const row = db.prepare("SELECT email FROM UserCredentials WHERE id > 4").get();
  expect(row.email).toBe("sam.rivera@example.com");
});

test("rejects a duplicate email (any case)", () => {
  registerUser(db, goodInput);
  expect(() => registerUser(db, { ...goodInput, email: "SAM.RIVERA@example.com", license: "87654321" })).toThrow("email already exists");
  expect(() => registerUser(db, { ...goodInput, email: "VISITOR@example.com", license: "87654321" })).toThrow("email already exists");
});

test("rejects a duplicate driver's license number", () => {
  registerUser(db, goodInput);
  expect(() => registerUser(db, { ...goodInput, email: "other@example.com" })).toThrow("license number already exists");
});

test("the validation rules from auth.js still apply", () => {
  expect(() => registerUser(db, { ...goodInput, firstName: "" })).toThrow("First name");
  expect(() => registerUser(db, { ...goodInput, dob: "31-01-2000" })).toThrow("Date of birth");
  expect(() => registerUser(db, { ...goodInput, license: "abc" })).toThrow("license");
  expect(() => registerUser(db, { ...goodInput, email: "not-an-email" })).toThrow("Email");
  expect(() => registerUser(db, { ...goodInput, password: "abc" })).toThrow("Password");
});

test("nothing is saved when the validation fails", () => {
  expect(() => registerUser(db, { ...goodInput, password: "abc" })).toThrow();
  const count = db.prepare("SELECT COUNT(*) AS n FROM UserCredentials").get().n;
  expect(count).toBe(4);
});

test("rejects a full name longer than 100 characters", () => {
  const longName = "a".repeat(40);
  expect(() => registerUser(db, { ...goodInput, firstName: longName, middleName: longName, lastName: longName })).toThrow("Full name");
});

test("rejects a missing database or details", () => {
  expect(() => registerUser(null, goodInput)).toThrow("required");
  expect(() => registerUser(db)).toThrow("required");
});

test("the database itself refuses a duplicate email", () => {
  const insert = db.prepare("INSERT INTO UserCredentials (email, password_hash, role) VALUES ('visitor@example.com', 'x', 'user')");
  expect(() => insert.run()).toThrow("UNIQUE constraint failed");
});