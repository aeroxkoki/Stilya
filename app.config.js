// app.config.js
const { getDefaultConfig } = require('@expo/config');
const path = require('path');

// Expoの設定を取得し、プロジェクトルートを明示的に設定
module.exports = ({ config }) => {
  // プロジェクトルートを明示的に設定
  const projectRoot = __dirname;
  
  // app.jsonから基本設定を取得（app.jsonが存在する場合）
  const defaultConfig = getDefaultConfig(projectRoot);
  
  // 設定をマージ
  return {
    ...defaultConfig,
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
