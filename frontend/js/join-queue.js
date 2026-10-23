// Join Queue screen
// Gets the services and queues from the backend with fetch

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
var serviceSelect = document.getElementById("serviceSelect");
var serviceDescription = document.getElementById("serviceDescription");
var estimatedWait = document.getElementById("estimatedWait");
var peopleWaiting = document.getElementById("peopleWaiting");
var joinButton = document.getElementById("joinButton");
var leaveButton = document.getElementById("leaveButton");
var message = document.getElementById("message");

// the services we get back from the server
var serviceList = [];

// put the open services into the dropdown
function fillServiceDropdown() {
  for (var i = 0; i < serviceList.length; i++) {
    if (serviceList[i].isOpen) {
      var option = document.createElement("option");
      option.value = serviceList[i].id;
      option.textContent = serviceList[i].name;
      serviceSelect.appendChild(option);
    }
  }
}

// find the service the visitor picked
function getSelectedService() {
  var selectedId = Number(serviceSelect.value);
  for (var i = 0; i < serviceList.length; i++) {
    if (serviceList[i].id === selectedId) {
      return serviceList[i];
    }
  }
  return null;
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
  serviceDescription.textContent = service.description;

  // ask the server who is waiting for this service
  fetch("/api/queues/" + service.id)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var waiting = data.entries.length;
      peopleWaiting.textContent = waiting;
      // simple estimate: people ahead of you times the service duration
      estimatedWait.textContent = (waiting + 1) * service.duration;
    })
    .catch(function () {
      message.textContent = "Could not load the queue. Please try again.";
    });
}

// turn the buttons on or off depending on if the visitor is already in a queue
function updateButtons() {
  fetch("/api/queues/status/" + currentUserEmail)
    .then(function (response) {
      // 200 means they are in a queue, 404 means they are not
      var inQueue = response.ok;
      joinButton.disabled = inQueue;
      leaveButton.disabled = !inQueue;
    })
    .catch(function () {
      message.textContent = "Could not reach the server. Please try again.";
    });
}

// when the Join Queue button is clicked
joinButton.onclick = function () {
  var service = getSelectedService();

  if (service === null) {
    message.textContent = "Please select a service first.";
    return;
  }

  fetch("/api/queues/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userEmail: currentUserEmail,
      visitorName: currentUserName,
      serviceId: service.id
    })
  })
    .then(function (response) {
      return response.json().then(function (data) {
        return { ok: response.ok, data: data };
      });
    })
    .then(function (result) {
      if (!result.ok) {
        // the server sends back a message explaining what was wrong
        message.textContent = result.data.error;
        return;
      }
      message.textContent = "You joined the queue for " + service.name + ". Your position is #" + result.data.position + ".";
      showServiceInfo();
      updateButtons();
    })
    .catch(function () {
      message.textContent = "Could not reach the server. Please try again.";
    });
};

// when the Leave Queue button is clicked
leaveButton.onclick = function () {
  fetch("/api/queues/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: currentUserEmail })
  })
    .then(function (response) {
      return response.json().then(function (data) {
        return { ok: response.ok, data: data };
      });
    })
    .then(function (result) {
      if (!result.ok) {
        message.textContent = result.data.error;
        return;
      }
      message.textContent = "You left the queue for " + result.data.historyRecord.serviceName + ".";
      showServiceInfo();
      updateButtons();
    })
    .catch(function () {
      message.textContent = "Could not reach the server. Please try again.";
    });
};

// when the dropdown changes, show the new service's info
serviceSelect.onchange = showServiceInfo;

// run when the page first loads: get the services, then fill in the page
fetch("/api/services")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    serviceList = data;
    fillServiceDropdown();
    showServiceInfo();
    updateButtons();
  })
  .catch(function () {
    message.textContent = "Could not load the services. Please try again.";
  });