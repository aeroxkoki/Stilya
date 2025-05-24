/**
 * Metro debugging context helpers
 * Provides utilities to help debug Metro bundler issues
 */

/**
 * Detects if the app is running in an EAS build environment
 */
export const isEasBuild = (): boolean => {
  return (
    process.env.EAS_BUILD === 'true' ||
    process.env.CI === 'true' ||
    false
  );
};

/**
 * Detects if Metro bundler should be skipped
 */
export const isMetroDisabled = (): boolean => {
  return (
    process.env.EAS_NO_METRO === 'true' ||
    process.env.EXPO_NO_CACHE === 'true' ||
    process.env.EAS_SKIP_JAVASCRIPT_BUNDLING === '1' ||
    false
  );
};

/**
 * Log Metro bundler context information for debugging
 */
export const logMetroContext = (): void => {
  if (__DEV__) {
    console.log('[Metro Context]', {
      isEasBuild: isEasBuild(),
      isMetroDisabled: isMetroDisabled(),
      nodeEnv: process.env.NODE_ENV,
      expoEnv: process.env.EXPO_ENV
    });
  }
};

export default {
  isEasBuild,
  isMetroDisabled,
  logMetroContext
};
