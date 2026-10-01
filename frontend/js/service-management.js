//handles the service management screen
const serviceForm = document.getElementById("service-form");
const serviceManagementList = document.getElementById("service-management-list");

let editingService = null;

//displays all current services
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

//use the shared validation from validation.js
attachLiveValidation(serviceForm);

serviceForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm(serviceForm)) {
        return;
    }

    const name = document.getElementById("service-name").value.trim();
    const description = document.getElementById("description").value.trim();
    const duration = Number(document.getElementById("duration").value);
    const priority = document.getElementById("priority").value;

    if (editingService) {
        editingService.name = name;
        editingService.description = description;
        editingService.duration = duration;
        editingService.priority = priority;

        editingService = null;

        serviceForm.querySelector('button[type="submit"]').textContent =
            "Create Service";
    } else {
        const newService = {
            id: services.length + 1,
            name: name,
            description: description,
            duration: duration,
            priority: priority,
            isOpen: true
        };

        services.push(newService);
    }

    serviceForm.reset();
    displayServices();
});

displayServices();
