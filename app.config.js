// 環境変数を読み込む
require('dotenv').config();

export default ({ config }) => {
  return {
    ...config,
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
      // assetBundlePatterns: [
      //   "**/*"
      // ],
      assetBundlePatterns: [
        "**/*"
      ],
      updates: {
        enabled: true,
        fallbackToCacheTimeout: 10000
      },
      // React Native 0.79.2に必要な設定
      jsEngine: "hermes",
      // New Architecture設定（Expo Go互換性のため）
      newArchEnabled: true,
      // 開発サーバーの設定
      packagerOpts: {
        sourceExts: ["js", "jsx", "ts", "tsx", "json", "svg"]
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
          // ネットワーク設定
          NSAppTransportSecurity: {
            NSAllowsArbitraryLoads: false, // HTTPSのみ許可
            NSExceptionDomains: {
              "supabase.co": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
              },
              "rakuten.co.jp": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
              },
              "image.rakuten.co.jp": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
              },
              "thumbnail.image.rakuten.co.jp": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
              },
              "via.placeholder.com": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
              },
              "images.unsplash.com": {
                NSExceptionAllowsInsecureHTTPLoads: false,
                NSIncludesSubdomains: true
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
          "WRITE_EXTERNAL_STORAGE",
          "VIBRATE"
        ]
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      scheme: "stilya",
      extra: {
        eas: {
          projectId: "beb25e0f-344b-4f2f-8b64-20614b9744a3"
        },
        // 環境変数から読み込む（ハードコードしない）
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
        // LinkShare API設定
        linkshareApiToken: process.env.EXPO_PUBLIC_LINKSHARE_API_TOKEN || "",
        linkshareMerchantId: process.env.EXPO_PUBLIC_LINKSHARE_MERCHANT_ID || "",
        linkshareApplicationId: process.env.EXPO_PUBLIC_LINKSHARE_APPLICATION_ID || "",
        linkshareAffiliateId: process.env.EXPO_PUBLIC_LINKSHARE_AFFILIATE_ID || "",
        // 楽天API設定
        rakutenAppId: process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || "",
        rakutenAffiliateId: process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || "",
        rakutenAppSecret: process.env.EXPO_PUBLIC_RAKUTEN_APP_SECRET || "",
        enableDevFeatures: process.env.NODE_ENV === 'development'
      }
    }
  };
};