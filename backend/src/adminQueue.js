//Admin queue management backend logic

function serveNextUser(queueEntries, serviceId) {
    const waiting = queueEntries.filter(function (entry) {
        return entry.serviceId === serviceId && entry.status !== "served";
    });

    if (waiting.length === 0) {
        throw new Error("No users are waiting in this queue.");
    }

    const nextUser = waiting[0];
    nextUser.status = "served";

    return nextUser;
}

module.exports = {
    serveNextUser
};
