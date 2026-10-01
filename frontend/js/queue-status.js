function showQueueStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
    window.location.href = "index.html";
    return;
}
const entry = queueEntries.find(function (e) { return e.userEmail === currentUser.email; });
if (!entry) {
    document.getElementById("message").textContent = "You are not in a queue right now.";
    document.getElementById("queue-card").hidden = true;
    return;
}
const ahead = queueEntries.filter(function (e) { return e.serviceId === entry.serviceId && e.status !== "served" && e.joinedAt < entry.joinedAt; });
document.getElementById("position").textContent = ahead.length + 1;
document.getElementById("status").textContent = entry.status;



const service = services.find(function (s) { return s.id === entry.serviceId; });
document.getElementById("service-name").textContent = service.name;
document.getElementById("wait-time").textContent = (ahead.length + 1) * service.duration + " minutes";


}
showQueueStatus();
