'use strict';

/**
 * Nested populate for components (never use `populate: true` — Strapi rejects it).
 */
const buildComponentPopulate = (strapi, componentUid) => {
  const model = strapi.getModel(componentUid);
  if (!model?.attributes) {
    return {};
  }

  const nested = {};

  for (const [name, attr] of Object.entries(model.attributes)) {
    if (!attr) {
      continue;
    }

    if (attr.type === 'component') {
      nested[name] = { populate: buildComponentPopulate(strapi, attr.component) };
    } else if (attr.type === 'media') {
      nested[name] = { select: ['*'] };
    } else if (attr.type === 'relation' && !('morphBy' in attr)) {
      nested[name] = true;
    }
  }

  return nested;
};

const buildDynamicZonePopulate = (strapi, attr) => {
  const on = {};
  for (const componentUid of attr.components || []) {
    on[componentUid] = { populate: buildComponentPopulate(strapi, componentUid) };
  }
  return Object.keys(on).length > 0 ? { on } : true;
};

const buildFieldPopulate = (strapi, uid, fieldName) => {
  const model = strapi.contentTypes[uid] || strapi.getModel(uid);
  const attr = model?.attributes?.[fieldName];

  if (!attr) {
    return true;
  }

  switch (attr.type) {
    case 'relation':
    case 'media':
      return true;

    case 'component':
      return { populate: buildComponentPopulate(strapi, attr.component) };

    case 'dynamiczone':
      return buildDynamicZonePopulate(strapi, attr);

    default:
      return true;
  }
};

const buildPopulate = (strapi, uid, populateList) => {
  if (!Array.isArray(populateList) || populateList.length === 0) {
    return undefined;
  }

  const populate = {};

  for (const field of populateList) {
    if (typeof field === 'string' && field.trim()) {
      const name = field.trim();
      populate[name] = buildFieldPopulate(strapi, uid, name);
    }
  }

  return Object.keys(populate).length > 0 ? populate : undefined;
};

module.exports = {
  buildPopulate,
  buildFieldPopulate,
  buildComponentPopulate,
};
