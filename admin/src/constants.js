import { PLUGIN_ID } from './pluginId';

const PERMISSIONS = {
  readCollectionTypes: [{ action: `plugin::${PLUGIN_ID}.collection-types.read`, subject: null }],
  manageTemplate: [{ action: `plugin::${PLUGIN_ID}.template.manage`, subject: null }],
};

const PLUGIN_API = `/${PLUGIN_ID}`;

export { PLUGIN_ID, PERMISSIONS, PLUGIN_API };
