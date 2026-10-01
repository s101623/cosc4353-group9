// Password reset is not implemented yet, can be removed down the line
const emailForm = document.getElementById("email-form");
const licenseForm = document.getElementById("license-form");
const resetMessage = document.getElementById("form-message");


attachLiveValidation(emailForm);
attachLiveValidation(licenseForm);

function showForm(formToShow, formToHide) {
  formToHide.hidden = true;
  formToShow.hidden = false;
  resetMessage.textContent = "";
}

document.getElementById("show-license-form").addEventListener("click", function (event) {
  event.preventDefault();
  showForm(licenseForm, emailForm);
});

document.getElementById("show-email-form").addEventListener("click", function (event) {
  event.preventDefault();
  showForm(emailForm, licenseForm);
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
licenseForm.addEventListener("submit", handleResetSubmit);
