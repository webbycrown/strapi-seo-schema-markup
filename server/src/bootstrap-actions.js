'use strict';

/** Users & Permissions plugin (public Content API). */
const contentApiActions = [
  {
    section: 'plugins',
    displayName: 'Read SEO schema markup (dedicated endpoint)',
    uid: 'schema.fetch',
    subCategory: 'strapi-seo-schema-markup',
    pluginName: 'strapi-seo-schema-markup',
  },
];

/** Admin panel (Settings → Global). */
const adminActions = [
  {
    section: 'plugins',
    displayName: 'Access structured data settings',
    uid: 'collection-types.read',
    subCategory: 'strapi-seo-schema-markup',
    pluginName: 'strapi-seo-schema-markup',
  },
  {
    section: 'plugins',
    displayName: 'Manage structured data templates',
    uid: 'template.manage',
    subCategory: 'strapi-seo-schema-markup',
    pluginName: 'strapi-seo-schema-markup',
  },
];

module.exports = { contentApiActions, adminActions };
