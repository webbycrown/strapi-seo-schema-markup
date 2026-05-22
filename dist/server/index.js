"use strict";
const { extendCollectionTypes } = require("./register-extend");
const { contentApiActions, adminActions } = require("./bootstrap-actions");
const contentTypes = require("./content-types");
const controllers = require("./controllers");
const services = require("./services");
const routes = require("./routes");
module.exports = {
  register({ strapi }) {
    extendCollectionTypes(strapi);
  },
  async bootstrap({ strapi }) {
    await strapi.service("admin::permission").actionProvider.registerMany(adminActions);
    if (strapi.plugin("users-permissions")) {
      await strapi.service("admin::permission").actionProvider.registerMany(contentApiActions);
    }
  },
  contentTypes,
  controllers,
  services,
  routes
};
