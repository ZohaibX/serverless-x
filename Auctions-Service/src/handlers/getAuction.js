import AWS from 'aws-sdk';
import middleware from '../lib/common-middleware';
import createError from 'http-errors';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// not actual http method but a helper fn for other http methods, to get an auction
export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamoDb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();

    auction = result.Item;
  } catch (error) {
    console.error('Error coming from getting an auction: ', error);
    throw new createError.InternalServerError(error);
  }

  if (!auction)
    throw new createError.NotFound(`Auction with ID "${id}" not found`);

  return auction;
}

// actual http fn
async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = middleware(getAuction);
