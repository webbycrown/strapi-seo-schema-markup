# Strapi SEO Schema Markup

Strapi 5 plugin for **JSON-LD structured data** (Schema.org). Adds a `seoSchemaMarkup` JSON field on every API collection type, global templates with `{{field}}` variables, and a dedicated read endpoint for frontends.

## Features

- **Per-entry schema** — override JSON-LD on any document in Content Manager
- **Global templates** — default JSON-LD per content type with `{{title}}`, `{{slug}}`, etc.
- **Dedicated API** — `GET /api/strapi-seo-schema-markup/schema` (entry → global template → none)
- **Admin UI** — Settings → Global → **Structured data**

## Requirements

- Strapi **5.x**
- Node **18–24**

## Installation

### From npm

```bash
npm install @webbycrown/strapi-seo-schema-markup
```

### From GitHub

```bash
npm install github:webbycrown/strapi-seo-schema-markup
```

### Enable the plugin

`config/plugins.js`:

```javascript
module.exports = ({ env }) => ({
  'strapi-seo-schema-markup': {
    enabled: true,
    resolve: '@webbycrown/strapi-seo-schema-markup',
  },
});
```

Rebuild the admin and restart:

```bash
npm run build
npm run develop
```

## Permissions

1. **Settings → Administration → Roles** — enable **Structured data** permissions for admin users.
2. **Settings → Users & Permissions → Roles** — enable **Read SEO schema markup** for Public/Authenticated if the schema API should be public.

## Public API

```http
GET /api/strapi-seo-schema-markup/schema?uid=api::article.article&documentId=<id>
GET /api/strapi-seo-schema-markup/schema?uid=api::article.article&slug=my-post&locale=en
```

| Query        | Required | Description                                      |
|-------------|----------|--------------------------------------------------|
| `uid`       | Yes      | Collection type UID (e.g. `api::article.article`) |
| `documentId`| One of   | Document ID                                      |
| `slug`      | these    | Slug (only if the type has a `slug` field)       |
| `locale`    | No       | Locale for localized types                       |

**Response** (example):

```json
{
  "data": {
    "uid": "api::article.article",
    "documentId": "abc123",
    "slug": "my-post",
    "locale": "en",
    "source": "entry",
    "schemaMarkup": { "@context": "https://schema.org", "@type": "Article", "headline": "..." }
  }
}
```

`source` is `entry` (document field), `global` (template), or omitted when empty.

## Global templates (admin)

**Settings → Global → Structured data** — pick a collection type, edit JSON-LD, use `{{fieldName}}` for dynamic values, preview against a document, then save.

## Local development (monorepo)

```bash
cd path/to/strapi-seo-schema-markup
npm install
npm run build
```

Link into a Strapi app:

```bash
npm run watch
# or: npm run watch:link  (with yalc)
```

In the Strapi project `config/plugins.js`:

```javascript
'strapi-seo-schema-markup': {
  enabled: true,
  resolve: './src/plugins/strapi-seo-schema-markup',
},
```

## Publishing

```bash
npm run build
npm publish --access public
```

## License

MIT © [WebbyCrown](https://github.com/webbycrown)
