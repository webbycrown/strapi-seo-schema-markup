'use strict';

const adminPolicy = [
  'admin::isAuthenticatedAdmin',
  {
    name: 'admin::hasPermissions',
    config: {
      actions: ['plugin::strapi-seo-schema-markup.template.manage'],
    },
  },
];

module.exports = {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/template',
      handler: 'template.find',
      config: { policies: adminPolicy },
    },
    {
      method: 'PUT',
      path: '/template',
      handler: 'template.update',
      config: { policies: adminPolicy },
    },
    {
      method: 'POST',
      path: '/template/preview',
      handler: 'template.preview',
      config: { policies: adminPolicy },
    },
  ],
};
