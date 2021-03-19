import AWS from 'aws-sdk';
import middleware from '../lib/common-middleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const { email } = event.requestContext.authorizer; // we have user data here

  const auction = await getAuctionById(id); // checking if auction exist -- will handle errors too

  if (auction.status !== 'OPEN')
    throw new createError.Forbidden('You cannot bid on a closed auction!');

  if (amount <= auction.highestBid.amount)
    throw new createError.Forbidden(
      `Your bid must be greater than ${auction.highestBid.amount}`
    );

  // seller cannot bid on his own auction
  if (email === auction.seller)
    throw new createError.Forbidden('You cannot bid on your own auction');

  // highest bidder cannot bid 2 times
  if (email === auction.highestBid.bidder)
    throw new createError.Forbidden(`You are already a higher bidder`);

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder', // set is a keyword
    ExpressionAttributeValues: { ':amount': amount, ':bidder': email },
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

export const handler = middleware(placeBid).use(
  validator({ inputSchema: placeBidSchema }) // we are not using useDefaults property as we used in getAuctions bcz we don't have any defaults in schema
);
