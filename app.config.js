export default {
  expo: {
    name: "Stilya",
    slug: "stilya",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    owner: "aeroxkoki",
    runtimeVersion: "1.0.0",
    updates: {
      url: "https://u.expo.dev/beb25e0f-344b-4f2f-8b64-20614b9744a3",
      fallbackToCacheTimeout: 0,
      enabled: true
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.stilya.app",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.stilya.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      "expo-notifications",
      "expo-localization"
    ],
    scheme: "stilya",
    jsEngine: "hermes",
    extra: {
      eas: {
        projectId: "beb25e0f-344b-4f2f-8b64-20614b9744a3"
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      linkshareApiToken: process.env.LINKSHARE_API_TOKEN,
      linkshareMerchantId: process.env.LINKSHARE_MERCHANT_ID,
      rakutenAppId: process.env.RAKUTEN_APP_ID,
      rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID
    }
  }
};