const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("form-message");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

const dobInput = document.getElementById("dob");

attachLiveValidation(registerForm);

// rules for password validation/registration
function checkPasswordRules() {
  const password = passwordInput.value;
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one letter, one number, and one special character.";
  }
  return "";
}

function checkPasswordsMatch() {
  if (confirmInput.value !== passwordInput.value) {
    return "Passwords do not match.";
  }
  return "";
}

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  registerMessage.textContent = "";

  let isValid = validateForm(registerForm);

  // only run the extra checks when the basic ones passed, so one message shows per field.
  if (checkField(passwordInput) === "") {
    const message = checkPasswordRules();
    showFieldError(passwordInput, message);
    if (message) isValid = false;
  }
  if (checkField(confirmInput) === "") {
    const message = checkPasswordsMatch();
    showFieldError(confirmInput, message);
    if (message) isValid = false;
  }

  const emailInput = document.getElementById("email");
  if (checkField(emailInput) === "" && (findUserByEmail(emailInput.value) || findUserByUsername(emailInput.value))) {
    showFieldError(emailInput, "An account with this email already exists.");
    isValid = false;
  }

  const usernameInput = document.getElementById("username");
  // also can't match someone's email or license number, since all three can be used to log in
  if (checkField(usernameInput) === "" && (findUserByUsername(usernameInput.value) || findUserByEmail(usernameInput.value) || findUserByLicense(usernameInput.value))) {
    showFieldError(usernameInput, "This username is already taken.");
    isValid = false;
  }

  const licenseInput = document.getElementById("license");
  if (checkField(licenseInput) === "" && (findUserByLicense(licenseInput.value) || findUserByUsername(licenseInput.value))) {
    showFieldError(licenseInput, "An account with this driver's license number already exists.");
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // self-registration always creates a visitor
  // taff accounts come from an admin invite.
  const firstName = document.getElementById("first-name").value.trim();
  const middleName = document.getElementById("middle-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();

  saveRegisteredUser({
    username: usernameInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    // kept as a string so leading zeros aren't lost
    license: licenseInput.value.trim(),
    dob: mdyToIso(dobInput.value.trim()),
    password: passwordInput.value,
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    // full name kept so screens that show user.name still work
    name: [firstName, middleName, lastName].filter(Boolean).join(" "),
    role: "user"
  });

  registerForm.reset();
  registerMessage.textContent = "Account created, you will be redirected shortly";
  // redirect to login
  setTimeout(function () {
    window.location.href = "index.html";
  }, 1500);
});
