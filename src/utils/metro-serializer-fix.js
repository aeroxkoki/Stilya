/**
 * Metro serializer compatibility helper for export:embed
 * This helps ensure proper output format for expo export:embed command
 * by dealing with serialization format issues.
 */

/**
 * A no-op function that serves as documentation for the serializer fix.
 * The actual implementation is in metro.config.js file.
 */
export const fixExpoExportEmbed = () => {
  // This is intentionally a no-op, as the fix is applied via metro.config.js
  if (__DEV__) {
    console.log('Metro serializer compatibility fix loaded');
  }
};

export default fixExpoExportEmbed;
