// Admin dashboard: shows every service from the backend API, grouped by service type,
// with search, filters and sorting. Filtering runs in the browser on the loaded list.

const serviceList = document.getElementById("service-list");
const serviceCount = document.getElementById("service-count");
const filterForm = document.getElementById("service-filters");
const searchInput = document.getElementById("filter-search");
const categoryFilter = document.getElementById("filter-category");
const statusFilter = document.getElementById("filter-status");
const priorityFilter = document.getElementById("filter-priority");
const sortSelect = document.getElementById("sort-services");
const clearFiltersButton = document.getElementById("clear-filters");

// Services have no type field yet, so the type comes from the service name.
// First match wins, anything that matches nothing goes under OTHER_CATEGORY.
const CATEGORIES = [
    { name: "Passports", pattern: /\bpassports?\b/i },
    { name: "Automotive", pattern: /\b(vehicles?|automotive|cars?|trucks?|motorcycles?|driver(s|'s)?)\b/i }
];
const OTHER_CATEGORY = "Other Services";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

let dashboardServices = [];

function getCategory(serviceName) {
    const match = CATEGORIES.find(function (category) {
        return category.pattern.test(serviceName);
    });
    return match ? match.name : OTHER_CATEGORY;
}

function categoryOrder() {
    return CATEGORIES.map(function (category) { return category.name; }).concat(OTHER_CATEGORY);
}

function compareByName(a, b) {
    return a.name.localeCompare(b.name);
}

const SORTERS = {
    name: compareByName,
    waiting: function (a, b) {
        return b.waiting - a.waiting || compareByName(a, b);
    },
    priority: function (a, b) {
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || compareByName(a, b);
    },
    duration: function (a, b) {
        return a.duration - b.duration || compareByName(a, b);
    }
};

function matchesFilters(service) {
    const search = searchInput.value.trim().toLowerCase();
    const haystack = (service.name + " " + service.description).toLowerCase();

    if (search && !haystack.includes(search)) {
        return false;
    }
    if (categoryFilter.value && service.category !== categoryFilter.value) {
        return false;
    }
    if (statusFilter.value && (service.isOpen ? "open" : "closed") !== statusFilter.value) {
        return false;
    }
    return !priorityFilter.value || service.priority === priorityFilter.value;
}

function plural(count, word) {
    return count + " " + word + (count === 1 ? "" : "s");
}

function createBadge(text, type) {
    const badge = document.createElement("span");
    badge.className = "badge badge-" + type;
    badge.textContent = text;
    return badge;
}

function createActionButton(text, url, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    if (className) {
        button.className = className;
    }
    button.addEventListener("click", function () {
        window.location.href = url;
    });
    return button;
}

function createServiceCard(service) {
    const card = document.createElement("div");
    card.className = "service-card";

    const name = document.createElement("h4");
    name.textContent = service.name;

    const badges = document.createElement("div");
    badges.className = "service-badges";
    badges.appendChild(service.isOpen ? createBadge("Open", "open") : createBadge("Closed", "closed"));
    badges.appendChild(createBadge(service.priority + " priority", service.priority));

    const description = document.createElement("p");
    description.className = "service-description";
    description.textContent = service.description;

    const details = document.createElement("p");
    details.textContent = plural(service.waiting, "visitor") + " waiting | " + service.duration + " minutes each";

    const actions = document.createElement("div");
    actions.className = "service-actions";
    actions.appendChild(createActionButton("Manage Queue", "queue-management.html?service=" + service.id));
    actions.appendChild(createActionButton("Edit Service", "service-management.html?edit=" + service.id, "button-secondary"));

    card.appendChild(name);
    card.appendChild(badges);
    card.appendChild(description);
    card.appendChild(details);
    card.appendChild(actions);
    return card;
}

function createServiceGroup(category, servicesInGroup) {
    const group = document.createElement("div");
    group.className = "service-group";

    const header = document.createElement("div");
    header.className = "service-group-header";

    const title = document.createElement("h3");
    title.textContent = category;

    const totalWaiting = servicesInGroup.reduce(function (total, service) {
        return total + service.waiting;
    }, 0);
    const summary = document.createElement("p");
    summary.textContent = plural(servicesInGroup.length, "service") + " | " + totalWaiting + " waiting";

    header.appendChild(title);
    header.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "service-grid";
    servicesInGroup.forEach(function (service) {
        grid.appendChild(createServiceCard(service));
    });

    group.appendChild(header);
    group.appendChild(grid);
    return group;
}

function showMessage(text) {
    const message = document.createElement("p");
    message.textContent = text;
    serviceList.appendChild(message);
}

function renderServices() {
    const visible = dashboardServices.filter(matchesFilters).sort(SORTERS[sortSelect.value]);

    serviceList.innerHTML = "";
    serviceCount.textContent = "Showing " + visible.length + " of " + plural(dashboardServices.length, "service");

    if (visible.length === 0) {
        showMessage(dashboardServices.length === 0
            ? "No services have been created yet."
            : "No services match these filters.");
        return;
    }

    categoryOrder().forEach(function (category) {
        const servicesInGroup = visible.filter(function (service) {
            return service.category === category;
        });
        if (servicesInGroup.length > 0) {
            serviceList.appendChild(createServiceGroup(category, servicesInGroup));
        }
    });
}

// only offer service types that exist in the current list
function fillCategoryFilter() {
    categoryOrder().forEach(function (category) {
        const exists = dashboardServices.some(function (service) {
            return service.category === category;
        });
        if (exists) {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Request failed: " + url);
    }
    return response.json();
}

async function loadDashboard() {
    try {
        const loadedServices = await fetchJson("/api/services");

        // load every queue at once so the page doesn't wait on them one by one
        dashboardServices = await Promise.all(loadedServices.map(async function (service) {
            const queueData = await fetchJson("/api/queues/" + service.id);
            return Object.assign({}, service, {
                category: getCategory(service.name),
                waiting: queueData.entries.length
            });
        }));

        fillCategoryFilter();
        renderServices();
    } catch (err) {
        serviceCount.textContent = "";
        serviceList.innerHTML = "";
        showMessage("Could not load services. Please try again.");
    }
}

filterForm.addEventListener("input", renderServices);

// Enter in the search box should not reload the page
filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
});

clearFiltersButton.addEventListener("click", function () {
    filterForm.reset();
    renderServices();
});

loadDashboard();
