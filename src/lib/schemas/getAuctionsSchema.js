// creating a schema for getAuctions query params

const schema = {
  properties: {
    queryStringParameters: {
      // queryStringParameter is a property of event
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED'],
          default: 'OPEN', // if we don't provide status as query string -- it will be OPEN by default
        },
      },
    },
  },
  required: ['queryStringParameters'], // this property is required
};

export default schema;
