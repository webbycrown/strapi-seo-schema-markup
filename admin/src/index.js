import { PLUGIN_ID, PERMISSIONS } from './constants';

export default {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
    });

    app.addSettingsLink('global', {
      id: `${PLUGIN_ID}-collection-types`,
      to: 'seo-schema-collection-types',

      intlLabel: {
        id: `${PLUGIN_ID}.settings.menu`,
        defaultMessage: 'Structured data',
      },

      permissions: PERMISSIONS.readCollectionTypes,

      Component: async () => {
        const component = await import('./pages/Router');

        return {
          default: component.Router,
        };
      },
    });
  },
};