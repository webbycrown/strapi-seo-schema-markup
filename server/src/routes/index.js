'use strict';

const { createContentApiRoutesFactory } = require('@strapi/utils');
const admin = require('./admin');

const contentApi = createContentApiRoutesFactory(() => [
  {
    method: 'GET',
    path: '/schema',
    handler: 'schema.fetch',
  },
]);

module.exports = {
  admin,
  'content-api': contentApi,
};
