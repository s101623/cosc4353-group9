// Estimated wait = position in line x service duration (minutes)
function calculateWaitTime(position, duration) {
  if (typeof position !== "number" || typeof duration !== "number") {
    throw new Error("Position and duration must be numbers");
  }
  if (!Number.isInteger(position) || position < 1) {
    throw new Error("Position must be a whole number of 1 or more");
  }
  if (!Number.isInteger(duration) || duration < 1) {
    throw new Error("Duration must be a whole number of 1 or more");
  }
  return position * duration;
}

// Position = people ahead in the same service + 1.
// Earlier joinedAt goes first. If the time is the same, the lower id goes first.
function getPosition(queueEntries, entry) {
  if (!Array.isArray(queueEntries) || !entry) {
    throw new Error("A list of queue entries and an entry are required");
  }
  let position = 1;
  for (let i = 0; i < queueEntries.length; i++) {
    const other = queueEntries[i];
    const sameService = other.serviceId === entry.serviceId;
    const stillWaiting = other.status !== "served";
    const isAhead =
      other.joinedAt < entry.joinedAt ||
      (other.joinedAt === entry.joinedAt && other.id < entry.id);
    if (sameService && stillWaiting && isAhead) {
      position++;
    }
  }
  return position;
}

module.exports = { calculateWaitTime, getPosition };