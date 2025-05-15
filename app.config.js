/**
 * Expo app configuration
 * This file extends the static configuration from app.json with dynamic settings
 */
module.exports = ({ config }) => {
  // Extend the configuration from app.json
  return {
    ...config,
    name: "Stilya",
    slug: "stilya",
    owner: "aeroxkoki",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    plugins: [
      "expo-secure-store",
      "expo-notifications",
      ["expo-linking", {
        prefixes: ['stilya://', 'https://stilya.app']
      }],
      "expo-localization"
    ],
    extra: {
      eas: {
        projectId: "beb25e0f-344b-4f2f-8b64-20614b9744a3"
      }
    }
  };
};