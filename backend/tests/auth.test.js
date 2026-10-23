const { registerUser, loginUser, requireRole, hashPassword, findUserByEmail } = require("../src/auth");

const goodInput = {
  firstName: "Alex",
  middleName: "",
  lastName: "Visitor",
  dob: "2000-05-14",
  license: "01234567",
  email: "Alex@Example.com",
  password: "Visitor#123"
};

function makeUsers() {
  return [
    { email: "admin@queuesmart.gov", license: "", name: "Dana Staff", role: "admin", passwordHash: hashPassword("Admin#123") }
  ];
}

// date of birth that makes someone exactly `years` old today, shifted by `dayShift` days
function dobForAge(years, dayShift) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setDate(date.getDate() + dayShift);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

test("registers a visitor and returns them without the password", () => {
  const users = makeUsers();
  const saved = registerUser(users, goodInput);
  expect(saved).toEqual({ email: "alex@example.com", license: "01234567", name: "Alex Visitor", role: "user" });
  expect(users.length).toBe(2);
  expect(users[1].passwordHash).not.toContain("Visitor#123");
});

test("registration always creates a user, even if admin is asked for", () => {
  const saved = registerUser(makeUsers(), { ...goodInput, role: "admin" });
  expect(saved.role).toBe("user");
});

test("full name includes the middle name when given", () => {
  const saved = registerUser(makeUsers(), { ...goodInput, middleName: "Jo" });
  expect(saved.name).toBe("Alex Jo Visitor");
});

test("rejects missing or too long names", () => {
  expect(() => registerUser([], { ...goodInput, firstName: "" })).toThrow("First name");
  expect(() => registerUser([], { ...goodInput, lastName: "   " })).toThrow("Last name");
  expect(() => registerUser([], { ...goodInput, lastName: "a".repeat(51) })).toThrow("50");
  expect(() => registerUser([], { ...goodInput, middleName: "a".repeat(51) })).toThrow("Middle name");
});

test("rejects a bad date of birth", () => {
  expect(() => registerUser([], { ...goodInput, dob: "" })).toThrow("required");
  expect(() => registerUser([], { ...goodInput, dob: "05/14/2000" })).toThrow("real date");
  expect(() => registerUser([], { ...goodInput, dob: "2001-02-29" })).toThrow("real date");
  expect(() => registerUser([], { ...goodInput, dob: "1899-12-31" })).toThrow("1900");
  expect(() => registerUser([], { ...goodInput, dob: "2999-01-01" })).toThrow("today");
});

test("must be at least 16 years old", () => {
  expect(() => registerUser([], { ...goodInput, dob: dobForAge(16, 1) })).toThrow("16");
  expect(registerUser([], { ...goodInput, dob: dobForAge(16, 0) }).role).toBe("user");
});

test("rejects a bad driver's license number", () => {
  expect(() => registerUser([], { ...goodInput, license: "" })).toThrow("required");
  expect(() => registerUser([], { ...goodInput, license: "12AB" })).toThrow("digits");
  expect(() => registerUser([], { ...goodInput, license: "123456789" })).toThrow("digits");
});

test("rejects a bad email", () => {
  expect(() => registerUser([], { ...goodInput, email: "" })).toThrow("required");
  expect(() => registerUser([], { ...goodInput, email: "not-an-email" })).toThrow("not valid");
  expect(() => registerUser([], { ...goodInput, email: "a".repeat(250) + "@x.com" })).toThrow("254");
});

test("rejects a weak password", () => {
  expect(() => registerUser([], { ...goodInput, password: "" })).toThrow("required");
  expect(() => registerUser([], { ...goodInput, password: "Ab#1" })).toThrow("8 to 64");
  expect(() => registerUser([], { ...goodInput, password: "a#1".repeat(22) })).toThrow("8 to 64");
  expect(() => registerUser([], { ...goodInput, password: "Password123" })).toThrow("special");
  expect(() => registerUser([], { ...goodInput, password: "Password#" })).toThrow("number");
});

test("rejects a duplicate email (any case) or license", () => {
  const users = makeUsers();
  registerUser(users, goodInput);
  expect(() => registerUser(users, { ...goodInput, email: "ALEX@example.com", license: "999" })).toThrow("email already exists");
  expect(() => registerUser(users, { ...goodInput, email: "other@example.com" })).toThrow("license number already exists");
});

test("rejects a missing user list or input", () => {
  expect(() => registerUser(null, goodInput)).toThrow("required");
  expect(() => registerUser([])).toThrow("required");
});

test("logs in with email (any case) or license number", () => {
  const users = makeUsers();
  registerUser(users, goodInput);
  expect(loginUser(users, "ALEX@example.com", "Visitor#123").email).toBe("alex@example.com");
  expect(loginUser(users, " 01234567 ", "Visitor#123").name).toBe("Alex Visitor");
});

test("login returns the role so the front end can pick the dashboard", () => {
  const user = loginUser(makeUsers(), "admin@queuesmart.gov", "Admin#123");
  expect(user.role).toBe("admin");
  expect(user.passwordHash).toBeUndefined();
});

test("wrong password and unknown account give the same message", () => {
  const users = makeUsers();
  expect(() => loginUser(users, "admin@queuesmart.gov", "wrong")).toThrow("Incorrect login or password");
  expect(() => loginUser(users, "nobody@example.com", "Admin#123")).toThrow("Incorrect login or password");
  expect(() => loginUser(users, "55555", "Admin#123")).toThrow("Incorrect login or password");
});

test("login rejects missing or too long fields", () => {
  expect(() => loginUser(null, "a@x.com", "pw")).toThrow("list");
  expect(() => loginUser([], "", "pw")).toThrow("required");
  expect(() => loginUser([], "a".repeat(255), "pw")).toThrow("254");
  expect(() => loginUser([], "a@x.com", "")).toThrow("Password is required");
  expect(() => loginUser([], "a@x.com", "a".repeat(65))).toThrow("64");
});

test("requireRole allows the right role and blocks others", () => {
  expect(requireRole({ role: "admin" }, "admin")).toBe(true);
  expect(requireRole({ role: "user" }, "user")).toBe(true);
  expect(() => requireRole({ role: "user" }, "admin")).toThrow("permission");
  expect(() => requireRole(null, "admin")).toThrow("logged in");
  expect(() => requireRole({ role: "admin" }, "owner")).toThrow("Role");
});

test("findUserByEmail ignores case and spaces", () => {
  expect(findUserByEmail(makeUsers(), " ADMIN@queuesmart.gov ").name).toBe("Dana Staff");
  expect(findUserByEmail(makeUsers(), "x@y.com")).toBeNull();
});
