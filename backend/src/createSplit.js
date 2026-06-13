const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const { calculateSplit, calculateUnequalSplit } = require("./calculate");

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return response(401, { message: "Unauthorized" });
    }

    const body = JSON.parse(event.body || "{}");

    const { billName, totalAmount, people, splitType = "equal" } = body;

    if (!billName || billName.trim() === "") {
      return response(400, { message: "Bill name is required" });
    }

    if (totalAmount === undefined || totalAmount === null) {
      return response(400, { message: "Amount is required" });
    }

    if (!Array.isArray(people) || people.length === 0) {
      return response(400, { message: "No people provided" });
    }

    if (splitType !== "equal" && splitType !== "unequal") {
      return response(400, { message: "splitType must be 'equal' or 'unequal'" });
    }

    const calculatedSplit = splitType === "unequal"
      ? calculateUnequalSplit(Number(totalAmount), people)
      : calculateSplit(Number(totalAmount), people);

    const split = {
      userId,
      splitId: crypto.randomUUID(),
      billName: billName.trim(),
      totalAmount: Number(totalAmount),
      people: calculatedSplit,
      splitType,
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}