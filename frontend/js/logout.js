// Log Out button, currenty only used for staff
const logoutLink = document.getElementById("logout");

logoutLink.addEventListener("click", function (event) {
  event.preventDefault();
  sessionStorage.removeItem("currentUser");
  window.location.href = "index.html";
});
