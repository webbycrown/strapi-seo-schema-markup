'use strict';

/**
 * Strapi plugin admin entrypoint.
 * Prefer admin/src so Strapi's bundler compiles JSX (GitHub / local).
 * Fallback to dist for the published npm package.
 */
let admin;
try {
  admin = require('./admin/src');
} catch (e) {
  admin = require('./dist/admin');
}

module.exports = admin.default || admin;
