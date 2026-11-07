// small helpers shared by the database versions of my modules

// find the id number for an email (returns null if there is no such user)
function findUserId(db, email) {
  const row = db.prepare("SELECT id FROM UserCredentials WHERE email = ?").get(email);
  if (row === undefined) {
    return null;
  }
  return row.id;
}

module.exports = { findUserId };