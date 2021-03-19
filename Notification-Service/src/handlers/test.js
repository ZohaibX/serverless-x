async function Test(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Test from https://codingly.io' }),
  };
}

export const handler = Test;
