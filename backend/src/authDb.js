const { registerUser: checkRegistration, hashPassword } = require("./auth");

function registerUser(db, input) {
  if (!db || !input) {
    throw new Error("A database and registration details are required");
  }

  // reuse the validation rules from auth.js
  const checked = checkRegistration([], input);

  const emailTaken = db.prepare("SELECT id FROM UserCredentials WHERE lower(email) = ?").get(checked.email);
  if (emailTaken !== undefined) {
    throw new Error("An account with this email already exists");
  }
  const licenseTaken = db.prepare("SELECT id FROM UserProfile WHERE drivers_license = ?").get(checked.license);
  if (licenseTaken !== undefined) {
    throw new Error("An account with this driver's license number already exists");
  }
  if (checked.name.length > 100) {
    throw new Error("Full name must be 100 characters or less");
  }

  // both rows are saved together, or neither is
  const save = db.transaction(function () {
    const info = db
      .prepare("INSERT INTO UserCredentials (email, password_hash, role) VALUES (?, ?, 'user')")
      .run(checked.email, hashPassword(input.password));
    db.prepare("INSERT INTO UserProfile (user_id, full_name, date_of_birth, drivers_license) VALUES (?, ?, ?, ?)")
      .run(info.lastInsertRowid, checked.name, input.dob, checked.license);
  });
  save();

  return checked;
}

module.exports = { registerUser };