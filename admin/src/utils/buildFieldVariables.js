const SKIP_FIELDS = new Set([
  'id',
  'documentId',
  'seoSchemaMarkup',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'locale',
  'localizations',
  'strapi_stage',
  'strapi_assignee',
]);

const SCALAR_TYPES = new Set([
  'string',
  'text',
  'richtext',
  'email',
  'password',
  'uid',
  'integer',
  'biginteger',
  'float',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'time',
  'enumeration',
  'json',
]);

const humanize = (name) =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const getFieldLabel = (name, metadatas) => {
  const meta = metadatas?.[name];
  return meta?.edit?.label || meta?.list?.label || humanize(name);
};

const findTypeByUid = (allTypes, uid) => (allTypes ?? []).find((t) => t.uid === uid);

/**
 * Build options for the field picker: { label, value (path), isRelation }
 */
const buildFieldVariables = (contentType, allTypes, metadatas = {}) => {
  const options = [];
  const attributes = contentType?.attributes ?? {};

  for (const [name, attr] of Object.entries(attributes)) {
    if (SKIP_FIELDS.has(name) || !attr) {
      continue;
    }

    const label = getFieldLabel(name, metadatas);

    if (SCALAR_TYPES.has(attr.type)) {
      options.push({
        label,
        value: name,
        isRelation: false,
      });
      continue;
    }

    if (attr.type === 'media') {
      options.push({ label: `${label} (url)`, value: `${name}.url`, isRelation: false });
      continue;
    }

    if (attr.type === 'relation' && ['oneToOne', 'manyToOne'].includes(attr.relation)) {
      const targetType = findTypeByUid(allTypes, attr.target);
      const targetAttrs = targetType?.attributes ?? {};

      for (const subName of Object.keys(targetAttrs)) {
        if (SKIP_FIELDS.has(subName)) {
          continue;
        }
        const subAttr = targetAttrs[subName];
        if (!subAttr || !SCALAR_TYPES.has(subAttr.type)) {
          continue;
        }
        const subLabel = humanize(subName);
        options.push({
          label: `${label} → ${subLabel}`,
          value: `${name}.${subName}`,
          isRelation: true,
          relationField: name,
        });
      }
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
};

export { buildFieldVariables, SKIP_FIELDS };
