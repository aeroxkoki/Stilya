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
      buildNumber: "1",
      // 権限設定
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Stilyaでファッションアイテムの写真を保存するために、フォトライブラリへのアクセスが必要です。",
        NSPhotoLibraryAddUsageDescription: "Stilyaでお気に入りのファッションアイテムを保存するために、フォトライブラリへの保存が必要です。",
        NSCameraUsageDescription: "Stilyaで自分のコーディネートを撮影するために、カメラへのアクセスが必要です。",
        NSUserTrackingUsageDescription: "あなたに最適なファッションアイテムを提案するために、パーソナライズされた広告を表示します。",
        ITSAppUsesNonExemptEncryption: false,
        // App Store 設定
        CFBundleDisplayName: "Stilya",
        CFBundleName: "Stilya",
        LSApplicationQueriesSchemes: ["mailto", "tel"],
        // ステータスバー設定
        UIStatusBarStyle: "UIStatusBarStyleDefault",
        UIViewControllerBasedStatusBarAppearance: false
      },
      // アプリアイコン設定
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.stilya.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      "expo-notifications",
      "expo-localization",
      [
        "expo-image",
        {
          "photosPermission": "Stilyaでファッションアイテムの写真を保存・閲覧するために必要です。"
        }
      ]
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