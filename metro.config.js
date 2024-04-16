const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('node:path');

/**
 + * Metro configuration
 + * https://facebook.github.io/metro/docs/configuration
 *
 + * @type {import("metro-config").MetroConfig}
 */
const config = {
  // These attempts to allow for local lib builds for dev/debug result in simulator crashes
  // watchFolders: [
  //   path.resolve(__dirname),
  //   path.resolve(__dirname, '../TruexAdRenderer-Kepler')
  // ],
  // resolver: {
  //   unstable_enableSymlinks: true // enable local debugging of libs via `npm link`
  // }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
