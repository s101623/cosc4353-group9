// Join Queue screen
// Uses the shared mock data from mock-data.js (no backend yet)

// For now we pretend this visitor is logged in.
// Later this will come from the login screen.
var currentUserEmail = "visitor@example.com";
var currentUserName = "Alex Visitor";

// grab the parts of the page we need
var serviceSelect = document.getElementById("serviceSelect");
var serviceDescription = document.getElementById("serviceDescription");
var estimatedWait = document.getElementById("estimatedWait");
var peopleWaiting = document.getElementById("peopleWaiting");
var joinButton = document.getElementById("joinButton");
var leaveButton = document.getElementById("leaveButton");
var message = document.getElementById("message");

// put the open services into the dropdown
function fillServiceDropdown() {
  for (var i = 0; i < services.length; i++) {
    if (services[i].isOpen) {
      var option = document.createElement("option");
      option.value = services[i].id;
      option.textContent = services[i].name;
      serviceSelect.appendChild(option);
    }
  }
}

// find the service the visitor picked
function getSelectedService() {
  var selectedId = Number(serviceSelect.value);
  for (var i = 0; i < services.length; i++) {
    if (services[i].id === selectedId) {
      return services[i];
    }
  }
  return null;
}

// count how many people are still in line for a service
function countWaiting(serviceId) {
  var count = 0;
  for (var i = 0; i < queueEntries.length; i++) {
    if (queueEntries[i].serviceId === serviceId && queueEntries[i].status !== "served") {
      count++;
    }
  }
  return count;
}

// find this visitor's current queue entry (or null if they are not in a queue)
function findMyEntry() {
  for (var i = 0; i < queueEntries.length; i++) {
    if (queueEntries[i].userEmail === currentUserEmail && queueEntries[i].status !== "served") {
      return queueEntries[i];
    }
  }
  return null;
}

// get a service name from its id
function getServiceName(serviceId) {
  for (var i = 0; i < services.length; i++) {
    if (services[i].id === serviceId) {
      return services[i].name;
    }
  }
  return "Unknown service";
}

// get the current date/time as text like 2026-10-01 09:20
function getNow() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

// show the description, wait time, and number of people for the picked service
function showServiceInfo() {
  var service = getSelectedService();
  if (service === null) {
    serviceDescription.textContent = "";
    estimatedWait.textContent = "";
    peopleWaiting.textContent = "";
    return;
  }
  var waiting = countWaiting(service.id);
  serviceDescription.textContent = service.description;
  peopleWaiting.textContent = waiting;
  // simple estimate: people ahead of you times the service duration
  estimatedWait.textContent = waiting * service.duration;
}

// turn the buttons on or off depending on if the visitor is already in a queue
function updateButtons() {
  var myEntry = findMyEntry();
  joinButton.disabled = (myEntry !== null);
  leaveButton.disabled = (myEntry === null);
}

// when the Join Queue button is clicked
joinButton.onclick = function () {
  var service = getSelectedService();

  if (service === null) {
    message.textContent = "Please select a service first.";
    return;
  }
  if (findMyEntry() !== null) {
    message.textContent = "You are already in a queue.";
    return;
  }

  // add the visitor to the queue (mock data only, so it resets when the page reloads)
  queueEntries.push({
    id: Date.now(),
    serviceId: service.id,
    visitorName: currentUserName,
    userEmail: currentUserEmail,
    joinedAt: getNow(),
    status: "waiting"
  });

  // add a notification
  notifications.push({
    id: Date.now(),
    userEmail: currentUserEmail,
    type: "queue update",
    message: "You joined the queue for " + service.name + ".",
    time: getNow(),
    read: false
  });

  message.textContent = "You joined the queue for " + service.name + ". Your position is #" + countWaiting(service.id) + ".";
  showServiceInfo();
  updateButtons();
};

// when the Leave Queue button is clicked
leaveButton.onclick = function () {
  var myEntry = findMyEntry();
  if (myEntry === null) {
    message.textContent = "You are not in a queue.";
    return;
  }

  var serviceName = getServiceName(myEntry.serviceId);

  // remove the visitor from the queue
  var index = queueEntries.indexOf(myEntry);
  queueEntries.splice(index, 1);

  // record it in the history
  history.push({
    id: Date.now(),
    userEmail: currentUserEmail,
    date: getNow().slice(0, 10),
    serviceName: serviceName,
    outcome: "left queue"
  });

  // add a notification
  notifications.push({
    id: Date.now(),
    userEmail: currentUserEmail,
    type: "status change",
    message: "You left the queue for " + serviceName + ".",
    time: getNow(),
    read: false
  });

  message.textContent = "You left the queue for " + serviceName + ".";
  showServiceInfo();
  updateButtons();
};

// when the dropdown changes, show the new service's info
serviceSelect.onchange = showServiceInfo;

// run when the page first loads
fillServiceDropdown();
showServiceInfo();
updateButtons();