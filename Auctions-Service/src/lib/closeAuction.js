import AWS from 'aws-sdk';
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  await dynamoDb.update(params).promise();
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'Your Item has been sold',
        recipient: 'zohaibbutt283@gmail.com', // here -- recipient should be seller
        body: `Woohoo! Ur Item "${title}" has been sold for $${amount}`,
      }),
    })
    .promise();

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: 'You Won an auction',
        recipient: 'zohaibbutt283@gmail.com', // here -- recipient should be bidder
        body: `What a great deal! Yoy got yourself "${title}" for $${amount}`,
      }),
    })
    .promise();

  return Promise.all([notifyBidder, notifySeller]);
}
