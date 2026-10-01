//displaying services and queue information on the admin dashboard

const serviceList = document.getElementById("service-list");

services.forEach(function (service) {
    const queueLength = queueEntries.filter(function (entry) {
        return entry.serviceId === service.id && entry.status !== "served";
    }).length;

    const serviceCard = document.createElement("div");
    serviceCard.className = "service-card";

    const serviceName = document.createElement("h3");
    serviceName.textContent = service.name;

    const serviceInfo = document.createElement("p");
    serviceInfo.textContent =
        service.duration + " minutes | " +
        service.priority + " priority";

    const queueInfo = document.createElement("p");
    queueInfo.textContent = queueLength + " visitor(s) waiting";

    const status = document.createElement("p");
    status.textContent = service.isOpen ? "Status: Open" : "Status: Closed";

    const statusButton = document.createElement("button");
    statusButton.textContent = service.isOpen ? "Close Queue" : "Open Queue";

    statusButton.addEventListener("click", function () {
        service.isOpen = !service.isOpen;

        status.textContent = service.isOpen
            ? "Status: Open"
            : "Status: Closed";

        statusButton.textContent = service.isOpen
            ? "Close Queue"
            : "Open Queue";
    });

    serviceCard.appendChild(serviceName);
    serviceCard.appendChild(serviceInfo);
    serviceCard.appendChild(queueInfo);
    serviceCard.appendChild(status);
    serviceCard.appendChild(statusButton);

    serviceList.appendChild(serviceCard);
});
