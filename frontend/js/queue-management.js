//handless the queue management screen
const serviceSelect = document.getElementById("queue-service");
const queueList = document.getElementById("queue-list");
const queueSummary = document.getElementById("queue-summary");
const serveNextButton = document.getElementById("serve-next");

//add services to the dropdown
services.forEach(function (service) {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
});

//returns the visitors waiting for the selected service
function getSelectedQueue() {
    const serviceId = Number(serviceSelect.value);

    return queueEntries.filter(function (entry) {
        return entry.serviceId === serviceId && entry.status !== "served";
    });
}

//displays the selected queue
function displayQueue() {
    const selectedQueue = getSelectedQueue();

    queueList.innerHTML = "";
    queueSummary.textContent =
        selectedQueue.length + " visitor(s) currently in queue";

    if (selectedQueue.length === 0) {
        const message = document.createElement("p");
        message.textContent = "There are currently no visitors in this queue.";
        queueList.appendChild(message);
        serveNextButton.disabled = true;
        return;
    }

    serveNextButton.disabled = false;

    selectedQueue.forEach(function (entry, index) {
        const visitorCard = document.createElement("div");
        visitorCard.className = "queue-card";

        const visitorName = document.createElement("h3");
        visitorName.textContent = entry.visitorName;

        const position = document.createElement("p");
        position.textContent = "Position: " + (index + 1);

        const status = document.createElement("p");
        status.textContent = "Status: " + entry.status;

        const moveUpButton = document.createElement("button");
        moveUpButton.textContent = "Move Up";
        moveUpButton.disabled = index === 0;

        moveUpButton.addEventListener("click", function () {
            moveVisitor(entry, -1);
        });

        const moveDownButton = document.createElement("button");
        moveDownButton.textContent = "Move Down";
        moveDownButton.disabled = index === selectedQueue.length - 1;

        moveDownButton.addEventListener("click", function () {
            moveVisitor(entry, 1);
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function () {
            removeVisitor(entry);
        });

        visitorCard.appendChild(visitorName);
        visitorCard.appendChild(position);
        visitorCard.appendChild(status);
        visitorCard.appendChild(moveUpButton);
        visitorCard.appendChild(moveDownButton);
        visitorCard.appendChild(removeButton);

        queueList.appendChild(visitorCard);
    });
}

//moves a visitor up or down in queueEntries
function moveVisitor(entry, direction) {
    const selectedQueue = getSelectedQueue();
    const currentPosition = selectedQueue.indexOf(entry);
    const newPosition = currentPosition + direction;

    if (newPosition < 0 || newPosition >= selectedQueue.length) {
        return;
    }

    const otherEntry = selectedQueue[newPosition];

    const firstIndex = queueEntries.indexOf(entry);
    const secondIndex = queueEntries.indexOf(otherEntry);

    queueEntries[firstIndex] = otherEntry;
    queueEntries[secondIndex] = entry;

    displayQueue();
}

//removes a visitor from the queue
function removeVisitor(entry) {
    const index = queueEntries.indexOf(entry);

    if (index !== -1) {
        queueEntries.splice(index, 1);
    }

    displayQueue();
}

//serves the visitor at the front of the queue
serveNextButton.addEventListener("click", function () {
    const selectedQueue = getSelectedQueue();

    if (selectedQueue.length === 0) {
        return;
    }

    selectedQueue[0].status = "served";
    displayQueue();
});

//show a different queue when another service is selected
serviceSelect.addEventListener("change", displayQueue);

displayQueue();
