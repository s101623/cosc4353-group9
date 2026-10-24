const { serveNextUser } = require("../src/adminQueue");

describe("Admin Queue Management", function () {
    let queueEntries;
    let services;
    let history;

    beforeEach(function () {
        queueEntries = [
            {
                id: 1,
                visitorName: "Alex Visitor",
                userEmail: "visitor@example.com",
                serviceId: 1,
                status: "waiting"
            },
            {
                id: 2,
                visitorName: "Jordan Visitor",
                userEmail: "visitor2@example.com",
                serviceId: 1,
                status: "waiting"
            }
        ];

        services = [
            {
                id: 1,
                name: "Driver License Renewal"
            }
        ];

        history = [];
    });

    test("serves the next user in the queue", function () {
        const result = serveNextUser(
            queueEntries,
            services,
            history,
            1
        );

        expect(result.visitorName).toBe("Alex Visitor");
        expect(result.status).toBe("served");
    });

    test("adds served user to history", function () {
        serveNextUser(
            queueEntries,
            services,
            history,
            1
        );

        expect(history.length).toBe(1);
        expect(history[0].userEmail).toBe("visitor@example.com");
        expect(history[0].serviceName).toBe("Driver License Renewal");
        expect(history[0].outcome).toBe("served");
    });

    test("rejects serving an empty queue", function () {
        expect(function () {
            serveNextUser(
                queueEntries,
                services,
                history,
                99
            );
        }).toThrow("No users are waiting in this queue.");
    });
});
