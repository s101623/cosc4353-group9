const { addHistoryRecord } = require("./history");

//admin queue management backend logic

function serveNextUser(queueEntries, services, history, serviceId) {
    const waiting = queueEntries.filter(function (entry) {
        return entry.serviceId === serviceId && entry.status !== "served";
    });

    if (waiting.length === 0) {
        throw new Error("No users are waiting in this queue.");
    }

    const nextUser = waiting[0];

    const service = services.find(function (item) {
        return item.id === serviceId;
    });

    if (!service) {
        throw new Error("That service does not exist");
    }

    nextUser.status = "served";

    const today = new Date().toISOString().slice(0, 10);

    addHistoryRecord(history, {
        userEmail: nextUser.userEmail,
        date: today,
        serviceName: service.name,
        outcome: "served"
    });

    return nextUser;
}

module.exports = {
    serveNextUser
};
