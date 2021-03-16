import AWS from 'aws-sdk';
import middleware from '../lib/common-middleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id); // checking if auction exist -- will handle errors too

  if (amount <= auction.highestBid.amount)
    throw new createError.Forbidden(
      `Your bid must be greater than ${auction.highestBid.amount}`
    );

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount', // set is a keyword
    ExpressionAttributeValues: { ':amount': amount },
    ReturnValues: 'ALL_NEW', // will return the item
  };

  let updatedAuction;

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error('Error coming from placing a bid: ', error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middleware(placeBid);
