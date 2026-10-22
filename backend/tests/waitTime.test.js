const { calculateWaitTime, getPosition } = require("../src/waitTime");

test("multiplies position by duration", () => {
  expect(calculateWaitTime(3, 15)).toBe(45);
});

test("first in line waits one full duration", () => {
  expect(calculateWaitTime(1, 30)).toBe(30);
});

test("rejects missing or non-number input", () => {
  expect(() => calculateWaitTime()).toThrow("must be numbers");
  expect(() => calculateWaitTime("2", 15)).toThrow("must be numbers");
});

test("rejects a position below 1 or with decimals", () => {
  expect(() => calculateWaitTime(0, 15)).toThrow("Position");
  expect(() => calculateWaitTime(1.5, 15)).toThrow("Position");
});

test("rejects a bad duration", () => {
  expect(() => calculateWaitTime(2, 0)).toThrow("Duration");
  expect(() => calculateWaitTime(2, -5)).toThrow("Duration");
});

const sampleEntries = [
  { id: 1, serviceId: 1, joinedAt: "2026-10-01 09:20", status: "waiting" },
  { id: 2, serviceId: 1, joinedAt: "2026-10-01 09:25", status: "waiting" },
  { id: 3, serviceId: 1, joinedAt: "2026-10-01 09:30", status: "waiting" },
  { id: 4, serviceId: 2, joinedAt: "2026-10-01 09:10", status: "waiting" }
];

test("first person in a service is position 1", () => {
  expect(getPosition(sampleEntries, sampleEntries[0])).toBe(1);
});

test("later joiners are counted behind earlier ones", () => {
  expect(getPosition(sampleEntries, sampleEntries[2])).toBe(3);
});

test("people in other services are not counted", () => {
  expect(getPosition(sampleEntries, sampleEntries[3])).toBe(1);
});

test("served people are not counted ahead", () => {
  const entries = [
    { id: 1, serviceId: 1, joinedAt: "2026-10-01 09:20", status: "served" },
    { id: 2, serviceId: 1, joinedAt: "2026-10-01 09:25", status: "waiting" }
  ];
  expect(getPosition(entries, entries[1])).toBe(1);
});

test("same joined time: lower id goes first", () => {
  const entries = [
    { id: 5, serviceId: 1, joinedAt: "2026-10-01 09:20", status: "waiting" },
    { id: 6, serviceId: 1, joinedAt: "2026-10-01 09:20", status: "waiting" }
  ];
  expect(getPosition(entries, entries[0])).toBe(1);
  expect(getPosition(entries, entries[1])).toBe(2);
});

test("getPosition rejects bad input", () => {
  expect(() => getPosition(null, sampleEntries[0])).toThrow("required");
  expect(() => getPosition(sampleEntries)).toThrow("required");
});