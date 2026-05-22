'use strict';

module.exports = {
  schema: {
    collectionName: 'seo_schema_templates',
    info: {
      name: 'SEO Schema Template',
      singularName: 'seo-schema-template',
      pluralName: 'seo-schema-templates',
      displayName: 'SEO Schema Template',
    },
    options: {
      draftAndPublish: false,
    },
    pluginOptions: {
      'content-manager': { visible: false },
      'content-type-builder': { visible: false },
    },
    attributes: {
      contentTypeUid: {
        type: 'string',
        required: true,
        unique: true,
      },
      template: {
        type: 'json',
      },
      populate: {
        type: 'json',
        default: [],
      },
      enabled: {
        type: 'boolean',
        default: true,
      },
    },
  },
};
