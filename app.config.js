module.exports = {
  name: 'Stilya',
  slug: 'stilya',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
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
    bundleIdentifier: 'com.yourcompany.stilya'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.stilya'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-secure-store'
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
    
    // 環境変数の定義確認用
    eas: {
      projectId: 'your-project-id'
    }
  }
};
