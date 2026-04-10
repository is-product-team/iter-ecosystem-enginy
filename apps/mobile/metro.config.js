const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
// This can be replaced with `find-up` if needed
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo root
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  'scheduler': path.resolve(workspaceRoot, 'node_modules/scheduler'),
};

// 3. Make sure typescript files in the monorepo are discoverable
config.resolver.sourceExts.push('mjs', 'ts', 'tsx');

// Enable package exports support (required for semver v7 subpath imports)
config.resolver.unstable_enablePackageExports = false;

// Allow Metro to look up nested node_modules (required for hoisted dependencies with nested children)
config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: './global.css' });