module.exports = {
  name: 'Stilya',
  slug: 'stilya',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  owner: "aeroxkoki",
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.stilya.app',
    buildNumber: '1',
    infoPlist: {
      UIBackgroundModes: ["fetch"],
      NSPhotoLibraryUsageDescription: "この機能を使用して、プロフィール写真を設定できます。",
      NSCameraUsageDescription: "この機能を使用して、写真を撮影しプロフィール写真に設定できます。",
      ITSAppUsesNonExemptEncryption: false,
      CFBundleAllowMixedLocalizations: true,
      LSApplicationQueriesSchemes: [
        "instagram",
        "twitter"
      ],
      UIRequiredDeviceCapabilities: [
        "armv7"
      ]
    },
    associatedDomains: [
      "applinks:stilya-app.com"
    ],
    appStoreUrl: "https://apps.apple.com/app/id1234567890"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.stilya.app',
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.stilya.app",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "stilya-app.com",
            pathPrefix: "/"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  locales: {
    ja: './assets/locales/ja.json',
    en: './assets/locales/en.json'
  },
  plugins: [
    'expo-secure-store',
    'expo-notifications',
    'expo-linking',
    'expo-localization'
  ],
  extra: {
    // Supabase設定（実際のキーは.envから取得）
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    
    // アフィリエイト設定
    linkshareApiToken: process.env.LINKSHARE_API_TOKEN,
    linkshareMerchantId: process.env.LINKSHARE_MERCHANT_ID,
    rakutenAppId: process.env.RAKUTEN_APP_ID,
    rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID,

    // Privacy Policy & Terms of Service
    privacyPolicyUrl: 'https://stilya-app.com/privacy-policy',
    termsOfServiceUrl: 'https://stilya-app.com/terms-of-service',
    
    // eas
    eas: {
      projectId: 'beb25e0f-344b-4f2f-8b64-20614b9744a3'
    }
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/beb25e0f-344b-4f2f-8b64-20614b9744a3'
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  jsEngine: 'hermes',
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'stilya',
          project: 'stilya-app',
          authToken: process.env.SENTRY_AUTH_TOKEN || 'YOUR-AUTH-TOKEN'
        }
      }
    ]
  }
};