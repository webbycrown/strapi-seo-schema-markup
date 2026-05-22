'use strict';

const TEMPLATE_UID = 'plugin::strapi-seo-schema-markup.seo-schema-template';

const templateService = ({ strapi }) => ({
  async findByContentTypeUid(contentTypeUid) {
    const rows = await strapi.documents(TEMPLATE_UID).findMany({
      filters: { contentTypeUid },
      pagination: { pageSize: 1 },
    });

    return rows?.[0] ?? null;
  },

  async upsert(contentTypeUid, data) {
    const existing = await this.findByContentTypeUid(contentTypeUid);

    const payload = {
      contentTypeUid,
      template: data.template ?? null,
      populate: Array.isArray(data.populate) ? data.populate : [],
      enabled: data.enabled !== false,
    };

    if (existing?.documentId) {
      return strapi.documents(TEMPLATE_UID).update({
        documentId: existing.documentId,
        data: payload,
      });
    }

    return strapi.documents(TEMPLATE_UID).create({ data: payload });
  },

  toDto(record) {
    if (!record) {
      return {
        contentTypeUid: null,
        template: null,
        populate: [],
        enabled: true,
        configured: false,
      };
    }

    return {
      documentId: record.documentId,
      contentTypeUid: record.contentTypeUid,
      template: record.template ?? null,
      populate: Array.isArray(record.populate) ? record.populate : [],
      enabled: record.enabled !== false,
      configured: Boolean(record.template && typeof record.template === 'object'),
    };
  },
});

module.exports = templateService;
