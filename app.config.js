export default {
  expo: {
    name: "Stilya",
    slug: "stilya",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stilya.app"
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
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      linkshareApiToken: process.env.LINKSHARE_API_TOKEN,
      linkshareMerchantId: process.env.LINKSHARE_MERCHANT_ID,
      rakutenAppId: process.env.RAKUTEN_APP_ID,
      rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID,
      eas: {
        projectId: "2d0acd29-ee85-4c17-9c79-40cc72e0bc28"
      }
    }
  }
};
