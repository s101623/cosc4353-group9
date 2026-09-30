// Account helpers shared by the login, register and forgot password screens.
// No backend yet: accounts are the mock users plus anyone who registered in this
// browser (saved in localStorage so the new account can log in afterwards).

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem("registeredUsers")) || [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredUser(user) {
  const registered = getRegisteredUsers();
  registered.push(user);
  localStorage.setItem("registeredUsers", JSON.stringify(registered));
}

function getAllUsers() {
  return users.concat(getRegisteredUsers());
}

function findUserByEmail(email) {
  const target = email.trim().toLowerCase();
  return getAllUsers().find(function (user) {
    return user.email.toLowerCase() === target;
  });
}

function findUserByUsername(username) {
  const target = username.trim().toLowerCase();
  return getAllUsers().find(function (user) {
    return user.username && user.username.toLowerCase() === target;
  });
}

function findUserByLicense(license) {
  const target = license.trim();
  return getAllUsers().find(function (user) {
    return user.license && user.license === target;
  });
}

// Login accepts email, username, or driver's license number.
// Usernames can contain "@", so the value can't be sorted by its format. Registration
// keeps the three from overlapping between accounts, so trying each in turn is safe.
function findUserByLogin(identifier) {
  const value = identifier.trim();
  return findUserByEmail(value) || findUserByUsername(value) || findUserByLicense(value);
}
