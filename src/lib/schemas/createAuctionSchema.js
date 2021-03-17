// schema for title in a body

const schema = {
  properties: {
    body: {
      // body is a property of event
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
      },
      required: ['title'], // in body -- title is req
    },
  },
  required: ['body'], // body is req
};

export default schema;
