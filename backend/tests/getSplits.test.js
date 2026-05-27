let mockSend;

jest.mock("@aws-sdk/lib-dynamodb", () => {
  const originalModule = jest.requireActual("@aws-sdk/lib-dynamodb");

  mockSend = jest.fn();

  return {
    ...originalModule,
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: mockSend
      }))
    }
  };
});

const { handler } = require("../src/getSplits");

const mockEvent = (userId = "user-123") => ({
  requestContext: {
    authorizer: {
      claims: {
        sub: userId
      }
    }
  }
});

beforeEach(() => {
  mockSend.mockReset();
});

test("new user returns empty array", async () => {
  mockSend.mockResolvedValue({ Items: [] });

  const result = await handler(mockEvent());
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(200);
  expect(body.splits).toEqual([]);
});

test("user with 3 splits returns all 3", async () => {
  mockSend.mockResolvedValue({
    Items: [
      { splitId: "1", billName: "Dinner" },
      { splitId: "2", billName: "Lunch" },
      { splitId: "3", billName: "Trip" }
    ]
  });

  const result = await handler(mockEvent());
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(200);
  expect(body.splits).toHaveLength(3);
});

test("unauthenticated request returns 401", async () => {
  const result = await handler({ requestContext: {} });
  const body = JSON.parse(result.body);

  expect(result.statusCode).toBe(401);
  expect(body.message).toBe("Unauthorized");
});