import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import middleware from '../lib/common-middleware';
import createError from 'http-errors';
import validator from '@middy/validator';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const end = new Date();

  end.setHours(now.getHours() + 1); // 1 hour after start date
  // 1 day later could be -- setDays(now.getDays() + 1)

  const auction = {
    id: uuid(),
    title: title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: end.toISOString(),
    highestBid: {
      amount: 0, // by default
    },
  };

  try {
    // put method is to create data
    await dynamoDb
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.error('error coming from createAuction Put Method: ', error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = middleware(createAuction).use(
  validator({ inputSchema: createAuctionSchema }) // we don't have any default values in this schema so we are not using that as we used in getAuctions
);
