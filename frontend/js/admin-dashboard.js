//displaying services and queue information from the backend API

const serviceList = document.getElementById("service-list");

async function displayServices() {
    const serviceResponse = await fetch("/api/services");
    const services = await serviceResponse.json();

    serviceList.innerHTML = "";

    for (const service of services) {
        const queueResponse = await fetch("/api/queues/" + service.id);
        const queueData = await queueResponse.json();

        const queueLength = queueData.entries
            ? queueData.entries.length
            : 0;

        const serviceCard = document.createElement("div");
        serviceCard.className = "service-card";

        const serviceName = document.createElement("h3");
        serviceName.textContent = service.name;

        const serviceInfo = document.createElement("p");
        serviceInfo.textContent =
            service.duration + " minutes | " +
            service.priority + " priority";

        const queueInfo = document.createElement("p");
        queueInfo.textContent =
            queueLength + " visitor(s) waiting";

        const status = document.createElement("p");
        status.textContent =
            service.isOpen ? "Status: Open" : "Status: Closed";

        serviceCard.appendChild(serviceName);
        serviceCard.appendChild(serviceInfo);
        serviceCard.appendChild(queueInfo);
        serviceCard.appendChild(status);

        serviceList.appendChild(serviceCard);
    }
}

displayServices();
