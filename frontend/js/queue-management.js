// Handles the queue management screen with backend API data

const serviceSelect = document.getElementById("queue-service");
const queueList = document.getElementById("queue-list");
const queueSummary = document.getElementById("queue-summary");
const serveNextButton = document.getElementById("serve-next");

async function loadServices() {
    const response = await fetch("/api/services");
    const services = await response.json();

    serviceSelect.innerHTML = "";

    services.forEach(function (service) {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        serviceSelect.appendChild(option);
    });

    if (services.length > 0) {
        await displayQueue();
    }
}

async function displayQueue() {
    const serviceId = Number(serviceSelect.value);

    const response = await fetch("/api/queues/" + serviceId);
    const data = await response.json();

    queueList.innerHTML = "";

    if (!response.ok) {
        queueSummary.textContent = "";
        const message = document.createElement("p");
        message.textContent = data.error;
        queueList.appendChild(message);
        serveNextButton.disabled = true;
        return;
    }

    const entries = data.entries;

    queueSummary.textContent =
        entries.length + " visitor(s) currently in queue";

    if (entries.length === 0) {
        const message = document.createElement("p");
        message.textContent = "There are currently no visitors in this queue.";
        queueList.appendChild(message);
        serveNextButton.disabled = true;
        return;
    }

    serveNextButton.disabled = false;

    entries.forEach(function (entry) {
        const visitorCard = document.createElement("div");
        visitorCard.className = "queue-card";

        const visitorName = document.createElement("h3");
        visitorName.textContent = entry.visitorName;

        const position = document.createElement("p");
        position.textContent = "Position: " + entry.position;

        const status = document.createElement("p");
        status.textContent = "Status: " + entry.status;

        visitorCard.appendChild(visitorName);
        visitorCard.appendChild(position);
        visitorCard.appendChild(status);

        queueList.appendChild(visitorCard);
    });
}

serveNextButton.addEventListener("click", async function () {
    const serviceId = Number(serviceSelect.value);

    const response = await fetch(
        "/api/queues/" + serviceId + "/serve-next",
        {
            method: "POST"
        }
    );

    if (!response.ok) {
        const error = await response.json();
        alert(error.error);
        return;
    }

    await displayQueue();
});

serviceSelect.addEventListener("change", displayQueue);

loadServices();
