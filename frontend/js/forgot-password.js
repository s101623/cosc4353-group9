// Password reset is not implemented yet (no backend or email service).
// This screen only validates the input and shows what would happen next.

const emailForm = document.getElementById("email-form");
const usernameForm = document.getElementById("username-form");
const resetMessage = document.getElementById("form-message");


attachLiveValidation(emailForm);
attachLiveValidation(usernameForm);

function showForm(formToShow, formToHide) {
  formToHide.hidden = true;
  formToShow.hidden = false;
  resetMessage.textContent = "";
}

document.getElementById("show-username-form").addEventListener("click", function (event) {
  event.preventDefault();
  showForm(usernameForm, emailForm);
});

document.getElementById("show-email-form").addEventListener("click", function (event) {
  event.preventDefault();
  showForm(emailForm, usernameForm);
});

function handleResetSubmit(event) {
  event.preventDefault();
  resetMessage.textContent = "";

  if (!validateForm(event.target)) {
    return;
  }

  // Same message whether or not an account matches, so accounts can't be guessed.
  resetMessage.textContent = "If the details match an account, password reset instructions will be sent to the email on file.";
  event.target.reset();
}

emailForm.addEventListener("submit", handleResetSubmit);
usernameForm.addEventListener("submit", handleResetSubmit);
