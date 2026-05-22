import { PLUGIN_ID } from './constants';

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

      permissions: [],

      Component: async () => {
        const component = await import('./pages/Router');

        return {
          default: component.Router,
        };
      },
    });
  },
};