// History screen
// Gets the history from the backend with fetch

// get the visitor who logged in (saved by the login screen)
var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (currentUser === null) {
  // not logged in, so send them to the login page
  window.location.href = "index.html";
  currentUser = { email: "" };
}
var currentUserEmail = currentUser.email;

// grab the parts of the page we need
var historyBody = document.getElementById("historyBody");
var historyTable = document.getElementById("historyTable");
var historyMessage = document.getElementById("historyMessage");

// show the history in the table
function showHistory(myHistory) {
  if (myHistory.length === 0) {
    historyTable.style.display = "none";
    historyMessage.textContent = "You have not joined any queues yet.";
    return;
  }

  for (var i = 0; i < myHistory.length; i++) {
    var row = document.createElement("tr");

    var dateCell = document.createElement("td");
    dateCell.textContent = myHistory[i].date;

    var serviceCell = document.createElement("td");
    serviceCell.textContent = myHistory[i].serviceName;

    var outcomeCell = document.createElement("td");
    outcomeCell.textContent = myHistory[i].outcome;

    row.appendChild(dateCell);
    row.appendChild(serviceCell);
    row.appendChild(outcomeCell);
    historyBody.appendChild(row);
  }
}

// ask the server for this visitor's history (newest first)
fetch("/api/history/" + currentUserEmail)
  .then(function (response) {
    return response.json();
  })
  .then(function (myHistory) {
    showHistory(myHistory);
  })
  .catch(function () {
    historyTable.style.display = "none";
    historyMessage.textContent = "Could not load your history. Please try again.";
  });