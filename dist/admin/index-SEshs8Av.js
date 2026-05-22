"use strict";
const PLUGIN_ID = "strapi-seo-schema-markup";
const PERMISSIONS = {
  readCollectionTypes: [{ action: `plugin::${PLUGIN_ID}.collection-types.read`, subject: null }],
  manageTemplate: [{ action: `plugin::${PLUGIN_ID}.template.manage`, subject: null }]
};
const PLUGIN_API = `/${PLUGIN_ID}`;
const index = {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID
    });
    app.addSettingsLink("global", {
      id: `${PLUGIN_ID}-collection-types`,
      to: "seo-schema-collection-types",
      intlLabel: {
        id: `${PLUGIN_ID}.settings.menu`,
        defaultMessage: "Structured data"
      },
      permissions: PERMISSIONS.readCollectionTypes,
      Component: () => Promise.resolve().then(() => require("./Router-DhW3z0NX.js")).then((mod) => ({
        default: mod.Router
      }))
    });
  }
};
exports.PERMISSIONS = PERMISSIONS;
exports.PLUGIN_API = PLUGIN_API;
exports.PLUGIN_ID = PLUGIN_ID;
exports.index = index;
