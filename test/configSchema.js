// eslint-disable-next-line no-unused-vars
const configSchema = {
  title: 'koji config',
  type: 'object',
  properties: {
    '@@editor': {
      type: 'array',
      minItems: 3,
      uniqueItems: true,
      items: {
        type: 'object',
      },
    },
    deploy: {
      type: 'object',
      required: ['frontend'],
      minItems: 1,
      items: {
        type: 'object',
      },
    },
    develop: {
      type: 'object',
      required: ['frontend'],
      minItems: 1,
      items: {
        type: 'object',
      },
    },
    serviceMap: {
      type: 'object',
    },
  },
  required: ['@@editor', 'deploy', 'develop', 'serviceMap'],
};

module.exports = configSchema;
