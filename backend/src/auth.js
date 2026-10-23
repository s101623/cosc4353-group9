const crypto = require("crypto");

const ROLES = ["user", "admin"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_AGE = 16;

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// passwords are never stored as plain text: "salt:hash" with a random salt per user
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

function checkPassword(password, stored) {
  const parts = stored.split(":");
  const hash = crypto.scryptSync(password, parts[0], 64);
  return crypto.timingSafeEqual(hash, Buffer.from(parts[1], "hex"));
}

// what the front end gets back: never the password hash
function publicUser(user) {
  return {
    email: user.email,
    license: user.license,
    name: user.name,
    role: user.role
  };
}

function findUserByEmail(users, email) {
  const target = email.trim().toLowerCase();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === target) {
      return users[i];
    }
  }
  return null;
}

function findUserByLicense(users, license) {
  const target = license.trim();
  for (let i = 0; i < users.length; i++) {
    if (users[i].license && users[i].license === target) {
      return users[i];
    }
  }
  return null;
}

// login accepts email or driver's license number, emails always contain "@"
function findUserByLogin(users, loginId) {
  return loginId.includes("@") ? findUserByEmail(users, loginId) : findUserByLicense(users, loginId);
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function checkName(value, label, required) {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(label + " is required");
    }
    return;
  }
  if (typeof value !== "string" || (required && value.trim() === "")) {
    throw new Error(label + " is required");
  }
  if (value.trim().length > 50) {
    throw new Error(label + " must be 50 characters or less");
  }
}

function checkPasswordRules(password) {
  if (typeof password !== "string" || password === "") {
    throw new Error("Password is required");
  }
  if (password.length < 8 || password.length > 64) {
    throw new Error("Password must be 8 to 64 characters");
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must contain at least one letter, one number, and one special character");
  }
}

// self-registration always creates a visitor ("user"), staff accounts are added by an admin
function registerUser(users, input) {
  if (!Array.isArray(users) || !input) {
    throw new Error("A user list and registration details are required");
  }

  checkName(input.firstName, "First name", true);
  checkName(input.middleName, "Middle name", false);
  checkName(input.lastName, "Last name", true);

  if (typeof input.dob !== "string" || input.dob.trim() === "") {
    throw new Error("Date of birth is required");
  }
  if (!isRealDate(input.dob)) {
    throw new Error("Date of birth must be a real date like 2000-01-31");
  }
  const today = getToday();
  if (input.dob < "1900-01-01" || input.dob >= today) {
    throw new Error("Date of birth must be between 1900-01-01 and today");
  }
  // the birthday MIN_AGE years later must be today or earlier
  if ((Number(input.dob.slice(0, 4)) + MIN_AGE) + input.dob.slice(4) > today) {
    throw new Error("You must be at least " + MIN_AGE + " years old to create an account");
  }

  if (typeof input.license !== "string" || input.license.trim() === "") {
    throw new Error("Driver's license number is required");
  }
  // kept as a string so leading zeros aren't lost
  if (!/^[0-9]{1,8}$/.test(input.license.trim())) {
    throw new Error("Driver's license number must be 1 to 8 digits");
  }

  if (typeof input.email !== "string" || input.email.trim() === "") {
    throw new Error("Email is required");
  }
  if (input.email.trim().length > 254) {
    throw new Error("Email must be 254 characters or less");
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    throw new Error("Email is not valid");
  }

  checkPasswordRules(input.password);

  if (findUserByEmail(users, input.email)) {
    throw new Error("An account with this email already exists");
  }
  if (findUserByLicense(users, input.license)) {
    throw new Error("An account with this driver's license number already exists");
  }

  const firstName = input.firstName.trim();
  const middleName = input.middleName ? input.middleName.trim() : "";
  const lastName = input.lastName.trim();

  const newUser = {
    email: input.email.trim().toLowerCase(),
    license: input.license.trim(),
    dob: input.dob,
    passwordHash: hashPassword(input.password),
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    name: [firstName, middleName, lastName].filter(Boolean).join(" "),
    role: "user"
  };
  users.push(newUser);
  return publicUser(newUser);
}

function loginUser(users, loginId, password) {
  if (!Array.isArray(users)) {
    throw new Error("A user list is required");
  }
  if (typeof loginId !== "string" || loginId.trim() === "") {
    throw new Error("Email or driver's license number is required");
  }
  if (loginId.trim().length > 254) {
    throw new Error("Login must be 254 characters or less");
  }
  if (typeof password !== "string" || password === "") {
    throw new Error("Password is required");
  }
  if (password.length > 64) {
    throw new Error("Password must be 64 characters or less");
  }

  const user = findUserByLogin(users, loginId.trim());
  // same message for unknown account and wrong password, so accounts can't be guessed
  if (!user || !checkPassword(password, user.passwordHash)) {
    throw new Error("Incorrect login or password");
  }
  return publicUser(user);
}

// for admin-only actions: throws unless the user has the needed role
function requireRole(user, role) {
  if (!ROLES.includes(role)) {
    throw new Error("Role must be user or admin");
  }
  if (!user) {
    throw new Error("You must be logged in");
  }
  if (user.role !== role) {
    throw new Error("You do not have permission to do this");
  }
  return true;
}

module.exports = { registerUser, loginUser, requireRole, hashPassword, findUserByEmail };
