const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo root
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force React and React-DOM resolution to workspace root to avoid duplicate instance errors
config.resolver.extraNodeModules = {
  'scheduler': path.resolve(workspaceRoot, 'node_modules/scheduler'),
  'react': path.resolve(workspaceRoot, 'node_modules/react'),
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
};

// Use the exclusionList from the internal metro-config to avoid export errors
// This is the safer way in modern Metro versions
const exclusionList = (() => {
  try {
    return require('metro-config/src/defaults/exclusionList');
  } catch (e) {
    try {
      return require('metro-config/src/defaults/blacklist');
    } catch (e) {
      // Fallback for very restrictive exports
      return () => /$.^/; 
    }
  }
})();

const blocklist = exclusionList([
  new RegExp(`${path.resolve(workspaceRoot, 'apps/mobile/node_modules/react/.*').replace(/[/\\\\]/g, '[/\\\\]')}`),
  new RegExp(`${path.resolve(workspaceRoot, 'apps/mobile/node_modules/react-dom/.*').replace(/[/\\\\]/g, '[/\\\\]')}`),
]);

config.resolver.blocklist = blocklist;
config.resolver.blacklistRE = blocklist;

// 3. Make sure typescript files in the monorepo are discoverable
config.resolver.sourceExts.push('mjs', 'ts', 'tsx');

module.exports = withNativeWind(config, { input: './global.css' });
