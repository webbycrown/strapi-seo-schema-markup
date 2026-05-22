'use strict';

/**
 * Strapi plugin server entrypoint.
 * Prefer source (GitHub / local) so routes and services load from server/src.
 * Fallback to dist for the published npm package.
 */
let server;
try {
  server = require('./server/src');
} catch (e) {
  server = require('./dist/server');
}

module.exports = server.default || server;
