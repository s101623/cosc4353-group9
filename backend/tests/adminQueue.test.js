const { serveNextUser } = require("../src/adminQueue");

describe("Admin Queue Management", function () {
    let queueEntries;

    beforeEach(function () {
        queueEntries = [
            {
                id: 1,
                visitorName: "Alex Visitor",
                serviceId: 1,
                status: "waiting"
            },
            {
                id: 2,
                visitorName: "Jordan Visitor",
                serviceId: 1,
                status: "waiting"
            }
        ];
    });

    test("serves the next user in the queue", function () {
        const result = serveNextUser(queueEntries, 1);

        expect(result.visitorName).toBe("Alex Visitor");
        expect(result.status).toBe("served");
    });

    test("rejects serving an empty queue", function () {
        expect(function () {
            serveNextUser(queueEntries, 99);
        }).toThrow("No users are waiting in this queue.");
    });
});
