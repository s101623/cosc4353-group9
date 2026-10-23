 const {
    createService,
    updateService,
    listServices
} = require("../src/services");

describe("Service Management", function () {
    let services;

    beforeEach(function () {
        services = [
            {
                id: 1,
                name: "Driver License Renewal",
                description: "Renew an existing license",
                duration: 15,
                priority: "medium",
                isOpen: true
            }
        ];
    });

    test("creates a new service", function () {
        const newService = createService(services, {
            name: "Passport Application",
            description: "Apply for a new passport",
            duration: 30,
            priority: "medium"
        });

        expect(newService.id).toBe(2);
        expect(newService.name).toBe("Passport Application");
        expect(services.length).toBe(2);
    });

    test("updates an existing service", function () {
        const updatedService = updateService(services, 1, {
            duration: 20,
            priority: "high"
        });

        expect(updatedService.duration).toBe(20);
        expect(updatedService.priority).toBe("high");
    });

    test("lists all services", function () {
        const result = listServices(services);

        expect(result.length).toBe(1);
        expect(result[0].name).toBe("Driver License Renewal");
    });

    test("rejects missing service name", function () {
        expect(function () {
            createService(services, {
                name: "",
                description: "Test service",
                duration: 10,
                priority: "low"
            });
        }).toThrow("Service name is required.");
    });

    test("rejects service name over 100 characters", function () {
        expect(function () {
            createService(services, {
                name: "A".repeat(101),
                description: "Test service",
                duration: 10,
                priority: "low"
            });
        }).toThrow("Service name must be 100 characters or less.");
    });

    test("rejects invalid duration", function () {
        expect(function () {
            createService(services, {
                name: "ID Replacement",
                description: "Replace an ID",
                duration: 0,
                priority: "low"
            });
        }).toThrow("Expected duration must be a positive number.");
    });

    test("rejects invalid priority", function () {
        expect(function () {
            createService(services, {
                name: "Vehicle Registration",
                description: "Register a vehicle",
                duration: 15,
                priority: "urgent"
            });
        }).toThrow("Priority must be low, medium, or high.");
    });

    test("rejects update for missing service", function () {
        expect(function () {
            updateService(services, 99, {
                duration: 20
            });
        }).toThrow("Service not found.");
    });
});
