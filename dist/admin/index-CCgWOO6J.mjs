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
      Component: () => import("./Router-B5h2SKdZ.mjs").then((mod) => ({
        default: mod.Router
      }))
    });
  }
};
export {
  PERMISSIONS as P,
  PLUGIN_API as a,
  PLUGIN_ID as b,
  index as i
};
