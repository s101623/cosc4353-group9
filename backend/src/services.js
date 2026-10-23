

function validateService(service) {
    if (!service.name || service.name.trim() === "") {
        throw new Error("Service name is required.");
    }

    if (service.name.length > 100) {
        throw new Error("Service name must be 100 characters or less.");
    }

    if (!service.description || service.description.trim() === "") {
        throw new Error("Description is required.");
    }

    if (typeof service.duration !== "number" || service.duration <= 0) {
        throw new Error("Expected duration must be a positive number.");
    }

    const validPriorities = ["low", "medium", "high"];

    if (!validPriorities.includes(service.priority)) {
        throw new Error("Priority must be low, medium, or high.");
    }
}

function createService(services, service) {
    validateService(service);

    const newService = {
        id: services.length + 1,
        name: service.name.trim(),
        description: service.description.trim(),
        duration: service.duration,
        priority: service.priority,
        isOpen: true
    };

    services.push(newService);
    return newService;
}

function updateService(services, serviceId, updates) {
    const service = services.find(function (item) {
        return item.id === serviceId;
    });

    if (!service) {
        throw new Error("Service not found.");
    }

    const updatedService = {
        ...service,
        ...updates
    };

    validateService(updatedService);

    service.name = updatedService.name.trim();
    service.description = updatedService.description.trim();
    service.duration = updatedService.duration;
    service.priority = updatedService.priority;

    return service;
}

function listServices(services) {
    return services;
}

module.exports = {
    createService,
    updateService,
    listServices
};
