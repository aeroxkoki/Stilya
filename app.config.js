export default {
  expo: {
    name: "Stilya",
    slug: "stilya",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    owner: "aeroxkoki",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    // 開発ビルド用の設定を追加
    developmentClient: {
      silentLaunch: false
    },
    updates: {
      enabled: false // 開発ビルドではOTA更新を無効化
    },
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
        // 開発ビルド用のネットワーク設定
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true, // 開発時のみ
          NSExceptionDomains: {
            "localhost": {
              NSTemporaryExceptionAllowsInsecureHTTPLoads: true
            }
          }
        },
        // App Store 設定
        CFBundleDisplayName: "Stilya",
        CFBundleName: "Stilya",
        LSApplicationQueriesSchemes: ["mailto", "tel", "stilya"],
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
    plugins: [],
    scheme: "stilya",
    extra: {
      eas: {
        projectId: "beb25e0f-344b-4f2f-8b64-20614b9744a3"
      },
      // 環境変数は直接設定（dotenvを使わない）
      supabaseUrl: "https://ddypgpljprljqrblpuli.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU",
      linkshareApiToken: "your_linkshare_token_here",
      linkshareMerchantId: "your_merchant_id_here",
      rakutenAppId: "1070253780037975195",
      rakutenAffiliateId: "3ad7bc23.8866b306.3ad7bc24.393c3977",
      enableDevFeatures: true
    }
  }
};