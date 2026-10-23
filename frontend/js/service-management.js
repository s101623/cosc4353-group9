//handles the service management screen with backend API data

const serviceForm = document.getElementById("service-form");
const serviceManagementList = document.getElementById("service-management-list");

let services = [];
let editingService = null;

async function loadServices() {
    const response = await fetch("/api/services");
    services = await response.json();
    displayServices();
}

function displayServices() {
    serviceManagementList.innerHTML = "";

    services.forEach(function (service) {
        const serviceCard = document.createElement("div");
        serviceCard.className = "service-card";

        const serviceName = document.createElement("h3");
        serviceName.textContent = service.name;

        const description = document.createElement("p");
        description.textContent = service.description;

        const serviceInfo = document.createElement("p");
        serviceInfo.textContent =
            "Expected Duration: " + service.duration +
            " minutes | Priority: " + service.priority;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            document.getElementById("service-name").value = service.name;
            document.getElementById("description").value = service.description;
            document.getElementById("duration").value = service.duration;
            document.getElementById("priority").value = service.priority;

            editingService = service;

            serviceForm.querySelector('button[type="submit"]').textContent =
                "Save Changes";
        });

        serviceCard.appendChild(serviceName);
        serviceCard.appendChild(description);
        serviceCard.appendChild(serviceInfo);
        serviceCard.appendChild(editButton);

        serviceManagementList.appendChild(serviceCard);
    });
}

attachLiveValidation(serviceForm);

serviceForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateForm(serviceForm)) {
        return;
    }

    const serviceData = {
        name: document.getElementById("service-name").value.trim(),
        description: document.getElementById("description").value.trim(),
        duration: Number(document.getElementById("duration").value),
        priority: document.getElementById("priority").value
    };

    let response;

    if (editingService) {
        response = await fetch("/api/services/" + editingService.id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(serviceData)
        });

        editingService = null;

        serviceForm.querySelector('button[type="submit"]').textContent =
            "Create Service";
    } else {
        response = await fetch("/api/services", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(serviceData)
        });
    }

    if (!response.ok) {
        const error = await response.json();
        alert(error.error);
        return;
    }

    serviceForm.reset();
    await loadServices();
});

loadServices();
