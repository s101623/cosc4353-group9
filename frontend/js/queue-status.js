function showQueueStatus() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
    window.location.href = "index.html";
    return;
}
    fetch("/api/queues/status/" + currentUser.email)
        .then(function (response) {
            if (response.status === 404) {
                document.getElementById("message").textContent = "You are not in a queue right now.";
                document.getElementById("queue-card").hidden = true;
                return null;
            }
            return response.json();
        })
        .then(function (data) {
            if (!data) {
                return;
            }
            document.getElementById("position").textContent = data.position;
            document.getElementById("status").textContent = data.status;
            document.getElementById("service-name").textContent = data.serviceName;
            document.getElementById("wait-time").textContent = data.estimatedWait + " minutes";
            
        });
}
showQueueStatus();
