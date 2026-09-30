const entry = queueEntries[0];
document.getElementById("position").textContent = entry.id;
document.getElementById("status").textContent = entry.status;



const service = services[0];
document.getElementById("service-name").textContent = service.name;
document.getElementById("wait-time").textContent = service.duration + " minutes";