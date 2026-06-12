const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const userId = event?.requestContext?.authorizer?.claims?.sub;
    if (!userId) return response(401, { message: "Unauthorized" });

    const rawCreatedAt = event.pathParameters?.createdAt;
    if (!rawCreatedAt) return response(400, { message: "createdAt path parameter is required" });

    const createdAt = decodeURIComponent(rawCreatedAt);

    await dynamoDb.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { userId, createdAt },
      })
    );

    return response(200, { message: "Split deleted successfully" });
  } catch (error) {
    return response(500, { message: error.message || "Something went wrong" });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}
