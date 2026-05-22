'use strict';

const { SEO_SCHEMA_MARKUP } = require('../register-extend');
const { resolveTemplate, hasEntrySchema } = require('./schema-resolver');
const { buildPopulate } = require('./populate-builder');

const contentTypeHasSlug = (model) => Boolean(model?.attributes?.slug);

const loadDocument = async (strapi, uid, model, { documentId, slug, locale, populate }) => {
  const baseParams = {};

  if (populate) {
    baseParams.populate = populate;
  }
  if (locale) {
    baseParams.locale = locale;
  }
  if (model.options?.draftAndPublish) {
    baseParams.status = 'published';
  }

  if (documentId) {
    return strapi.documents(uid).findOne({ ...baseParams, documentId });
  }

  if (slug) {
    return strapi.documents(uid).findFirst({
      ...baseParams,
      filters: { slug: { $eq: slug } },
    });
  }

  return null;
};

const buildResult = ({ uid, doc, source, schemaMarkup }) => ({
  uid,
  documentId: doc.documentId,
  slug: doc.slug ?? null,
  locale: doc.locale ?? null,
  source,
  schemaMarkup,
});

const seoSchemaService = ({ strapi }) => ({
  contentTypeHasSlug,

  async getSchemaForDocument({ uid, documentId, slug, locale }) {
    const model = strapi.contentTypes[uid];
    if (!model || model.kind !== 'collectionType') {
      throw new Error('Invalid content type UID');
    }

    if (!documentId && !slug) {
      throw new Error('Either documentId or slug is required');
    }

    if (slug && !documentId && !contentTypeHasSlug(model)) {
      throw new Error('This content type does not have a slug field');
    }

    const templateService = strapi.plugin('strapi-seo-schema-markup').service('template');
    const globalRecord = await templateService.findByContentTypeUid(uid);
    const globalDto = templateService.toDto(globalRecord);

    const populateFields = buildPopulate(strapi, uid, globalDto.populate);
    const doc = await loadDocument(strapi, uid, model, {
      documentId,
      slug: documentId ? undefined : slug,
      locale,
      populate: populateFields,
    });

    if (!doc) {
      return null;
    }

    const entryValue = doc[SEO_SCHEMA_MARKUP];

    if (hasEntrySchema(entryValue)) {
      return buildResult({ uid, doc, source: 'entry', schemaMarkup: entryValue });
    }

    if (!globalDto.enabled || !globalDto.template) {
      return buildResult({ uid, doc, source: 'none', schemaMarkup: null });
    }

    const resolved = resolveTemplate(globalDto.template, doc);

    return buildResult({ uid, doc, source: 'global', schemaMarkup: resolved });
  },
});

module.exports = seoSchemaService;
  