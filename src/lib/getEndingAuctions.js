// we will get the ending auctions by querying status and ending date

import AWS from 'aws-sdk';
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getEndedAuctions() {
  const now = new Date(); // we will get current date

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate', // we have specified this special index in serverless resources
    KeyConditionExpression: '#status = :status AND endingAt <= :now', // property for global index
    ExpressionAttributeValues: {
      ':status': 'OPEN',
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const result = await dynamoDb.query(params).promise();
  return result.Items;
}
