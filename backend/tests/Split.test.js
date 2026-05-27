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