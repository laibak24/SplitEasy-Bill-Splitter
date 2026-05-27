const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const { calculateSplit } = require("./calculate");

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return response(401, { message: "Unauthorized" });
    }

    const body = JSON.parse(event.body || "{}");

    const { billName, totalAmount, people } = body;

    if (!billName || billName.trim() === "") {
      return response(400, { message: "Bill name is required" });
    }

    if (totalAmount === undefined || totalAmount === null) {
      return response(400, { message: "Amount is required" });
    }

    if (!Array.isArray(people) || people.length === 0) {
      return response(400, { message: "No people provided" });
    }

    const calculatedSplit = calculateSplit(Number(totalAmount), people);

    const split = {
      userId,
      splitId: crypto.randomUUID(),
      billName: billName.trim(),
      totalAmount: Number(totalAmount),
      people: calculatedSplit,
      createdAt: new Date().toISOString()
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: split
      })
    );

    return response(201, {
      message: "Split created successfully",
      split
    });
  } catch (error) {
    return response(400, {
      message: error.message || "Something went wrong"
    });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}