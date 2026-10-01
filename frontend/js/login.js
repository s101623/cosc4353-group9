const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("form-message");

attachLiveValidation(loginForm);

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  loginMessage.textContent = "";

  if (!validateForm(loginForm)) {
    return;
  }

  const loginId = document.getElementById("login-id").value;
  const password = document.getElementById("password").value;
  const user = findUserByLogin(loginId);

  // Same message for unknown account and wrong password, so accounts can't be guessed.
  if (!user || user.password !== password) {
    loginMessage.textContent = "Incorrect login or password.";
    return;
  }

  sessionStorage.setItem("currentUser", JSON.stringify({ email: user.email, name: user.name, role: user.role }));
  window.location.href = user.role === "admin" ? "admin-dashboard.html" : "user-dashboard.html";
});
