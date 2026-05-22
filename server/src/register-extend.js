'use strict';

/** Attribute key on every API collection type (REST + GraphQL + Document API). */
const SEO_SCHEMA_MARKUP = 'seoSchemaMarkup';

/**
 * Injects a JSON field (object or array — e.g. JSON-LD object) on each user collection type (`api::*`).
 * Same pattern as Strapi Review Workflows (programmatic `content-types.extend`).
 */
function extendCollectionTypes(strapi) {
  const uids = Object.keys(strapi.contentTypes).filter((uid) => {
    const def = strapi.contentTypes[uid];
    return def.kind === 'collectionType' && uid.startsWith('api::');
  });

  const jsonAttribute = {
    type: 'json',
    writable: true,
    configurable: false,
    visible: true,
    private: false,
    searchable: false,
  };

  for (const uid of uids) {
    strapi.get('content-types').extend(uid, (contentType) => {
      const existing = contentType.attributes[SEO_SCHEMA_MARKUP];
      if (existing && existing.type === 'json') {
        return;
      }
      if (existing && existing.type === 'text') {
        contentType.attributes[SEO_SCHEMA_MARKUP] = { ...jsonAttribute };
        return;
      }
      Object.assign(contentType.attributes, {
        [SEO_SCHEMA_MARKUP]: { ...jsonAttribute },
      });
    });
  }
}

module.exports = {
  SEO_SCHEMA_MARKUP,
  extendCollectionTypes,
};
