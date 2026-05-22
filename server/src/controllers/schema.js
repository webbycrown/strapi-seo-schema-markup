'use strict';

module.exports = {
  /**
   * GET /api/strapi-seo-schema-markup/schema?uid=&documentId=&slug=&locale=
   * Provide documentId or slug (slug only when the content type has a slug field).
   * Priority: entry seoSchemaMarkup → global template (with {{variables}}) → null
   */
  async fetch(ctx) {
    const { uid, documentId, slug, locale } = ctx.query;

    if (!uid || typeof uid !== 'string') {
      return ctx.badRequest('Query parameter "uid" is required (e.g. api::article.article).');
    }

    const hasDocumentId = typeof documentId === 'string' && documentId.trim() !== '';
    const hasSlug = typeof slug === 'string' && slug.trim() !== '';

    if (!hasDocumentId && !hasSlug) {
      return ctx.badRequest(
        'Query parameter "documentId" or "slug" is required (use slug only when the collection has a slug field).'
      );
    }

    const model = strapi.contentTypes[uid];
    if (!model || model.kind !== 'collectionType') {
      return ctx.badRequest('Invalid "uid": must be a collection type.');
    }

    const seoSchema = strapi.plugin('strapi-seo-schema-markup').service('seo-schema');

    if (hasSlug && !hasDocumentId && !seoSchema.contentTypeHasSlug(model)) {
      return ctx.badRequest('This content type does not have a slug field; use documentId instead.');
    }

    try {
      const result = await seoSchema.getSchemaForDocument({
        uid,
        documentId: hasDocumentId ? documentId.trim() : undefined,
        slug: hasSlug ? slug.trim() : undefined,
        locale: typeof locale === 'string' && locale.trim() !== '' ? locale.trim() : undefined,
      });

      if (!result) {
        return ctx.notFound('Document not found.');
      }

      ctx.set('Content-Type', 'application/json; charset=utf-8');
      ctx.body = { data: result };
    } catch (err) {
      strapi.log.error(err);
      return ctx.badRequest(err.message || 'Could not load schema.');
    }
  },
};
