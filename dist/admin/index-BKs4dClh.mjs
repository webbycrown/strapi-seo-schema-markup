const PLUGIN_ID = "strapi-seo-schema-markup";
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
      permissions: [],
      Component: async () => {
        const component = await import("./Router-De6Ru5FP.mjs");
        return {
          default: component.Router
        };
      }
    });
  }
};
export {
  PLUGIN_ID as P,
  index as i
};
