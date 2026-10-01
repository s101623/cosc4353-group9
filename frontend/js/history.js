// History screen
// Uses the shared mock data from mock-data.js (no backend yet)

// For now we pretend this visitor is logged in.
// Later this will come from the login screen.
var currentUserEmail = "visitor@example.com";

// grab the parts of the page we need
var historyBody = document.getElementById("historyBody");
var historyTable = document.getElementById("historyTable");
var historyMessage = document.getElementById("historyMessage");

// get only this visitor's past queues
function getMyHistory() {
  var myHistory = [];
  for (var i = 0; i < history.length; i++) {
    if (history[i].userEmail === currentUserEmail) {
      myHistory.push(history[i]);
    }
  }
  return myHistory;
}

// show the history in the table
function showHistory() {
  var myHistory = getMyHistory();

  if (myHistory.length === 0) {
    historyTable.style.display = "none";
    historyMessage.textContent = "You have not joined any queues yet.";
    return;
  }

  // newest first (dates look like 2026-09-24, so we can compare them as text)
  myHistory.sort(function (a, b) {
    if (a.date < b.date) {
      return 1;
    }
    if (a.date > b.date) {
      return -1;
    }
    return 0;
  });

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

// run when the page first loads
showHistory();