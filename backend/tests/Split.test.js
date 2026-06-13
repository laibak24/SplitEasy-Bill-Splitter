jest.mock("@aws-sdk/lib-dynamodb", () => {
  const originalModule = jest.requireActual("@aws-sdk/lib-dynamodb");

  return {
    ...originalModule,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn().mockResolvedValue({})
      }))
    }
  };
});

const { handler } = require("../src/createSplit");

const mockEvent = (body, userId = "user-123") => ({
  body: JSON.stringify(body),
  requestContext: {
    authorizer: {
      claims: {
        sub: userId
      }
    }
  }
});

test("saves split with valid payload and returns 201", async () => {
  const event = mockEvent({
    billName: "Dinner",
    totalAmount: 90,
    people: ["Ali", "Sara", "Usman"]
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(201);
  expect(body.message).toBe("Split created successfully");
  expect(body.split.billName).toBe("Dinner");
  expect(body.split.people).toHaveLength(3);
});

test("missing amount field returns 400", async () => {
  const event = mockEvent({
    billName: "Dinner",
    people: ["Ali", "Sara"]
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(400);
  expect(body.message).toBe("Amount is required");
});

test("empty people list returns 400", async () => {
  const event = mockEvent({
    billName: "Dinner",
    totalAmount: 100,
    people: []
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(400);
  expect(body.message).toBe("No people provided");
});

test("negative amount returns 400", async () => {
  const event = mockEvent({
    billName: "Dinner",
    totalAmount: -100,
    people: ["Ali"]
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(400);
  expect(body.message).toBe("Amount cannot be negative");
});

test("unauthenticated request returns 401", async () => {
  const event = {
    body: JSON.stringify({
      billName: "Dinner",
      totalAmount: 100,
      people: ["Ali"]
    }),
    requestContext: {}
  };

  const result = await handler(event);

  expect(result.statusCode).toBe(401);
});

test("empty bill name returns 400", async () => {
  const event = mockEvent({
    billName: "",
    totalAmount: 100,
    people: ["Ali"]
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(400);
  expect(body.message).toBe("Bill name is required");
});

// ── Unequal split ──────────────────────────────────────────────────────────

test("creates unequal split by amount and returns 201", async () => {
  const event = mockEvent({
    billName: "Lunch",
    totalAmount: 100,
    splitType: "unequal",
    people: [
      { name: "Ali",  amount: 60 },
      { name: "Sara", amount: 40 },
    ],
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(201);
  expect(body.split.splitType).toBe("unequal");
  expect(body.split.people).toHaveLength(2);
  expect(body.split.people[0]).toMatchObject({ name: "Ali",  owes: 60, percentage: 60 });
  expect(body.split.people[1]).toMatchObject({ name: "Sara", owes: 40, percentage: 40 });
});

test("unequal split stores splitType field in result", async () => {
  const event = mockEvent({
    billName: "Dinner",
    totalAmount: 1500,
    splitType: "unequal",
    people: [
      { name: "Ali",   amount: 600 },
      { name: "Sara",  amount: 525 },
      { name: "Usman", amount: 375 },
    ],
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(201);
  expect(body.split.splitType).toBe("unequal");
  expect(body.split.people).toHaveLength(3);
});

test("unequal split with mismatched amounts returns 400", async () => {
  const event = mockEvent({
    billName: "Lunch",
    totalAmount: 100,
    splitType: "unequal",
    people: [
      { name: "Ali",  amount: 70 },
      { name: "Sara", amount: 40 },
    ],
  });

  const result = await handler(event);

  expect(result.statusCode).toBe(400);
});

test("invalid splitType value returns 400", async () => {
  const event = mockEvent({
    billName: "Lunch",
    totalAmount: 100,
    splitType: "random",
    people: ["Ali"],
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(400);
  expect(body.message).toBe("splitType must be 'equal' or 'unequal'");
});

test("equal split still works when splitType is explicit", async () => {
  const event = mockEvent({
    billName: "Dinner",
    totalAmount: 90,
    splitType: "equal",
    people: ["Ali", "Sara", "Usman"],
  });

  const result = await handler(event);
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(201);
  expect(body.split.splitType).toBe("equal");
  expect(body.split.people).toHaveLength(3);
  expect(body.split.people[0].owes).toBe(30);
});