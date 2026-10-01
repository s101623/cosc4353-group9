// User Dashboard screen
// Uses the shared mock data from mock-data.js (no backend yet)

// get the visitor who logged in (saved by the login screen)
var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
if (currentUser === null) {
  // not logged in, so send them to the login page
  window.location.href = "index.html";
  currentUser = { email: "", name: "" };
}
var currentUserEmail = currentUser.email;
var currentUserName = currentUser.name;

// grab the parts of the page we need
var welcomeMessage = document.getElementById("welcomeMessage");
var currentQueueInfo = document.getElementById("currentQueueInfo");
var viewQueueLink = document.getElementById("viewQueueLink");
var serviceList = document.getElementById("serviceList");
var notificationCount = document.getElementById("notificationCount");
var notificationList = document.getElementById("notificationList");

// find a service by its id
function getService(serviceId) {
  for (var i = 0; i < services.length; i++) {
    if (services[i].id === serviceId) {
      return services[i];
    }
  }
  return null;
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

// work out the visitor's position in line for their service
function getPosition(myEntry) {
  var position = 0;
  for (var i = 0; i < queueEntries.length; i++) {
    var entry = queueEntries[i];
    if (entry.serviceId === myEntry.serviceId && entry.status !== "served" && entry.joinedAt <= myEntry.joinedAt) {
      position++;
    }
  }
  return position;
}

// show the welcome message
function showWelcome() {
  welcomeMessage.textContent = "Welcome back, " + currentUserName + "!";
}

// show the current queue status
function showCurrentQueue() {
  var myEntry = findMyEntry();

  if (myEntry === null) {
    currentQueueInfo.textContent = "You are not in a queue right now.";
    viewQueueLink.style.display = "none";
    return;
  }

  var service = getService(myEntry.serviceId);
  var position = getPosition(myEntry);
  // simple estimate: people ahead of you times the service duration
    var wait = position * service.duration;

  currentQueueInfo.textContent = service.name + " | Position: #" + position + " | Estimated wait: " + wait + " minutes | Status: " + myEntry.status;
  viewQueueLink.style.display = "inline";
}

// show the services that are open
function showServices() {
  for (var i = 0; i < services.length; i++) {
    if (services[i].isOpen) {
      var item = document.createElement("li");
      item.textContent = services[i].name + " (about " + services[i].duration + " minutes)";
      serviceList.appendChild(item);
    }
  }

  if (serviceList.children.length === 0) {
    serviceList.textContent = "No services are open right now.";
  }
}

// show a short summary of this visitor's notifications
function showNotifications() {
  var myNotifications = [];
  var unread = 0;

  for (var i = 0; i < notifications.length; i++) {
    if (notifications[i].userEmail === currentUserEmail) {
      myNotifications.push(notifications[i]);
      if (notifications[i].read === false) {
        unread++;
      }
    }
  }

  notificationCount.textContent = "You have " + unread + " unread notification(s).";

  // show the 3 most recent ones
  var start = Math.max(0, myNotifications.length - 3);
  for (var j = myNotifications.length - 1; j >= start; j--) {
    var item = document.createElement("li");
    item.textContent = myNotifications[j].message + " (" + myNotifications[j].time + ")";
    notificationList.appendChild(item);
  }
}

// run when the page first loads
showWelcome();
showCurrentQueue();
showServices();
showNotifications();