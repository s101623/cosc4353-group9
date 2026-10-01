const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
const entry = queueEntries.find(function (e) { return e.userEmail === currentUser.email; });
document.getElementById("position").textContent = entry.id;
document.getElementById("status").textContent = entry.status;



const service = services.find(function (s) { return s.id === entry.serviceId; });
document.getElementById("service-name").textContent = service.name;
document.getElementById("wait-time").textContent = service.duration + " minutes";