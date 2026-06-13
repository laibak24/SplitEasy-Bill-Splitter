const { calculateSplit, calculateUnequalSplit } = require("../src/calculate");

test("splits equally among 3 people", () => {
  const result = calculateSplit(90, ["Ali", "Sara", "Usman"]);

  expect(result).toEqual([
    { name: "Ali", owes: 30 },
    { name: "Sara", owes: 30 },
    { name: "Usman", owes: 30 }
  ]);
});

test("total of 0 gives each person 0", () => {
  const result = calculateSplit(0, ["Ali", "Sara"]);

  expect(result).toEqual([
    { name: "Ali", owes: 0 },
    { name: "Sara", owes: 0 }
  ]);
});

test("single person owes full amount", () => {
  const result = calculateSplit(100, ["Ali"]);

  expect(result).toEqual([
    { name: "Ali", owes: 100 }
  ]);
});

test("floating point bill rounds to 2 decimal places", () => {
  const result = calculateSplit(10.99, ["Ali", "Sara", "Usman"]);

  expect(result).toEqual([
    { name: "Ali", owes: 3.66 },
    { name: "Sara", owes: 3.66 },
    { name: "Usman", owes: 3.66 }
  ]);
});

test("throws error for empty people list", () => {
  expect(() => calculateSplit(100, [])).toThrow("No people provided");
});

test("throws error for negative amount", () => {
  expect(() => calculateSplit(-50, ["Ali"])).toThrow("Amount cannot be negative");
});

test("deduplicates duplicate names", () => {
  const result = calculateSplit(100, ["Ali", "Ali", "Sara"]);

  expect(result).toEqual([
    { name: "Ali", owes: 50 },
    { name: "Sara", owes: 50 }
  ]);
});

// ── calculateUnequalSplit ──────────────────────────────────────────────────

test("calculateUnequalSplit returns correct owes and percentage", () => {
  const result = calculateUnequalSplit(100, [
    { name: "Ali", amount: 60 },
    { name: "Sara", amount: 40 },
  ]);
  expect(result).toEqual([
    { name: "Ali", owes: 60, percentage: 60 },
    { name: "Sara", owes: 40, percentage: 40 },
  ]);
});

test("calculateUnequalSplit handles three-way unequal split", () => {
  const result = calculateUnequalSplit(1500, [
    { name: "Ali", amount: 600 },
    { name: "Sara", amount: 525 },
    { name: "Usman", amount: 375 },
  ]);
  expect(result).toEqual([
    { name: "Ali",   owes: 600, percentage: 40 },
    { name: "Sara",  owes: 525, percentage: 35 },
    { name: "Usman", owes: 375, percentage: 25 },
  ]);
});

test("calculateUnequalSplit throws when amounts don't sum to total", () => {
  expect(() => calculateUnequalSplit(100, [
    { name: "Ali", amount: 60 },
    { name: "Sara", amount: 30 },
  ])).toThrow("must sum to total");
});

test("calculateUnequalSplit throws for negative person amount", () => {
  expect(() => calculateUnequalSplit(100, [
    { name: "Ali", amount: -10 },
    { name: "Sara", amount: 110 },
  ])).toThrow("Invalid amount");
});

test("calculateUnequalSplit throws for empty people list", () => {
  expect(() => calculateUnequalSplit(100, [])).toThrow("No people provided");
});

test("calculateUnequalSplit throws for negative total", () => {
  expect(() => calculateUnequalSplit(-50, [{ name: "Ali", amount: -50 }])).toThrow();
});

test("calculateUnequalSplit handles zero total", () => {
  const result = calculateUnequalSplit(0, [
    { name: "Ali", amount: 0 },
    { name: "Sara", amount: 0 },
  ]);
  expect(result).toEqual([
    { name: "Ali",  owes: 0, percentage: 0 },
    { name: "Sara", owes: 0, percentage: 0 },
  ]);
});