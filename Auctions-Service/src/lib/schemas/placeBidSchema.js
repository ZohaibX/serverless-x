const schema = {
  properties: {
    body: {
      // body is a property of event
      type: 'object',
      properties: {
        amount: {
          type: 'number',
        },
      },
      required: ['amount'], // in body -- amount is req
    },
  },
  required: ['body'], // body is req
};

export default schema;
