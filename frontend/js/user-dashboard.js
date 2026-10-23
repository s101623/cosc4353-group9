// User Dashboard screen
// Gets the queue status, services and notifications from the backend with fetch

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

// show the welcome message
function showWelcome() {
  welcomeMessage.textContent = "Welcome back, " + currentUserName + "!";
}

// show the current queue status
function showCurrentQueue() {
  fetch("/api/queues/status/" + currentUserEmail)
    .then(function (response) {
      // 404 means the visitor is not in a queue
      if (!response.ok) {
        currentQueueInfo.textContent = "You are not in a queue right now.";
        viewQueueLink.style.display = "none";
        return;
      }
      return response.json().then(function (status) {
        currentQueueInfo.textContent = status.serviceName + " | Position: #" + status.position + " | Estimated wait: " + status.estimatedWait + " minutes | Status: " + status.status;
        viewQueueLink.style.display = "inline";
      });
    })
    .catch(function () {
      currentQueueInfo.textContent = "Could not load your queue. Please try again.";
      viewQueueLink.style.display = "none";
    });
}

// show the services that are open
function showServices() {
  fetch("/api/services")
    .then(function (response) {
      return response.json();
    })
    .then(function (services) {
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
    })
    .catch(function () {
      serviceList.textContent = "Could not load the services. Please try again.";
    });
}

// show a short summary of this visitor's notifications
function showNotifications() {
  fetch("/api/notifications/" + currentUserEmail)
    .then(function (response) {
      return response.json();
    })
    .then(function (myNotifications) {
      var unread = 0;
      for (var i = 0; i < myNotifications.length; i++) {
        if (myNotifications[i].read === false) {
          unread++;
        }
      }

      notificationCount.textContent = "You have " + unread + " unread notification(s).";

      // the server sends the newest first, so show the first 3
      var end = Math.min(3, myNotifications.length);
      for (var j = 0; j < end; j++) {
        var item = document.createElement("li");
        item.textContent = myNotifications[j].message + " (" + myNotifications[j].time + ")";
        notificationList.appendChild(item);
      }
    })
    .catch(function () {
      notificationCount.textContent = "Could not load your notifications. Please try again.";
    });
}

// run when the page first loads
showWelcome();
showCurrentQueue();
showServices();
showNotifications();