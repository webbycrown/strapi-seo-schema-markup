'use strict';

module.exports = {
  async find(ctx) {
    const { contentTypeUid } = ctx.query;

    if (!contentTypeUid || typeof contentTypeUid !== 'string') {
      return ctx.badRequest('Query parameter "contentTypeUid" is required.');
    }

    const templateService = strapi.plugin('strapi-seo-schema-markup').service('template');
    const record = await templateService.findByContentTypeUid(contentTypeUid);

    ctx.body = { data: templateService.toDto(record) };
  },

  async update(ctx) {
    const { contentTypeUid, template, populate, enabled } = ctx.request.body ?? {};

    if (!contentTypeUid || typeof contentTypeUid !== 'string') {
      return ctx.badRequest('Body field "contentTypeUid" is required.');
    }

    const model = strapi.contentTypes[contentTypeUid];
    if (!model || model.kind !== 'collectionType') {
      return ctx.badRequest('Invalid contentTypeUid.');
    }

    if (template !== null && template !== undefined && typeof template !== 'object') {
      return ctx.badRequest('Field "template" must be a JSON object or null.');
    }

    const templateService = strapi.plugin('strapi-seo-schema-markup').service('template');
    const record = await templateService.upsert(contentTypeUid, {
      template,
      populate,
      enabled,
    });

    ctx.body = { data: templateService.toDto(record) };
  },

  async preview(ctx) {
    const { contentTypeUid, documentId, slug, locale } = ctx.request.body ?? {};

    const hasDocumentId = typeof documentId === 'string' && documentId.trim() !== '';
    const hasSlug = typeof slug === 'string' && slug.trim() !== '';

    if (!contentTypeUid || (!hasDocumentId && !hasSlug)) {
      return ctx.badRequest(
        'Fields "contentTypeUid" and either "documentId" or "slug" are required.'
      );
    }

    const model = strapi.contentTypes[contentTypeUid];
    const seoSchema = strapi.plugin('strapi-seo-schema-markup').service('seo-schema');

    if (hasSlug && !hasDocumentId && model && !seoSchema.contentTypeHasSlug(model)) {
      return ctx.badRequest('This content type does not have a slug field; use documentId instead.');
    }

    try {
      // Same logic as GET /api/strapi-seo-schema-markup/schema (entry → global → none)
      const result = await seoSchema.getSchemaForDocument({
        uid: contentTypeUid,
        documentId: hasDocumentId ? documentId.trim() : undefined,
        slug: hasSlug ? slug.trim() : undefined,
        locale: typeof locale === 'string' && locale.trim() !== '' ? locale.trim() : undefined,
      });

      if (!result) {
        return ctx.notFound('Document not found.');
      }

      ctx.body = { data: result };
    } catch (err) {
      strapi.log.error(err);
      return ctx.badRequest(err.message || 'Preview failed.');
    }
  },
};
