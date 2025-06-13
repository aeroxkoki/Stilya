// scripts/prebuild-config.js
const fs = require('fs');
const path = require('path');

module.exports = {
  // Ensure proper Metro configuration for development builds
  modifyMetroConfig: (config) => {
    return {
      ...config,
      resolver: {
        ...config.resolver,
        unstable_enablePackageExports: false, // Critical for Supabase compatibility
        unstable_enableSymlinks: true,
        sourceExts: [...config.resolver.sourceExts, 'cjs'],
        resolverMainFields: ['react-native', 'browser', 'main'],
      },
    };
  },
  
  // iOS-specific modifications
  modifyIosProject: (xcodeProject) => {
    // Add necessary iOS permissions
    const infoPlist = {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true, // Development only
      },
    };
    return xcodeProject;
  },
};
