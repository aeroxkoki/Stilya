// 環境変数の管理
// Expo の Constants を使用して環境変数を安全に取得

// 動的インポートを使用して安全に読み込む
let Constants: any = null;

// 開発環境判定
export const IS_DEV = __DEV__;

// Supabase設定（オンラインのみ）
const getSupabaseConfig = () => {
  // プロジェクトIDに基づく正しいURL
  const projectId = 'ddypgpljprljqrblpuli';
  
  let url = `https://${projectId}.supabase.co`;
  let anonKey = '';
  
  // Constantsの遅延読み込み
  if (!Constants) {
    try {
      Constants = require('expo-constants').default;
    } catch (error) {
      // エラーは無視（Expo Goでは利用できない場合がある）
    }
  }
  
  // Constantsが利用可能な場合のみアクセス
  if (Constants) {
    try {
      const extra = Constants.manifest?.extra || Constants.expoConfig?.extra || {};
      url = extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || url;
      anonKey = extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    } catch (e) {
      // エラーは無視
    }
  }
  
  // 環境変数から直接取得を試みる
  if (!url || !anonKey) {
    url = process.env.EXPO_PUBLIC_SUPABASE_URL || url;
    anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  
  return { url, anonKey };
};

const supabaseConfig = getSupabaseConfig();
export const SUPABASE_URL = supabaseConfig.url;
export const SUPABASE_ANON_KEY = supabaseConfig.anonKey;

// API設定の取得
const getApiConfigs = () => {
  let configs = {
    linkshareApiToken: '',
    linkshareMerchantId: '',
    linkshareApplicationId: '',
    linkshareAffiliateId: '',
    a8NetApiKey: '',
    rakutenAppId: '',
    rakutenAffiliateId: '',
    rakutenAppSecret: '',
    version: '1.0.0'
  };
  
  // Constantsの遅延読み込み
  if (!Constants) {
    try {
      Constants = require('expo-constants').default;
    } catch (error) {
      // エラーは無視
    }
  }
  
  // Constantsが利用可能な場合のみアクセス
  if (Constants) {
    try {
      const extra = Constants.manifest?.extra || Constants.expoConfig?.extra || {};
      configs.linkshareApiToken = extra.linkshareApiToken || '';
      configs.linkshareMerchantId = extra.linkshareMerchantId || '';
      configs.linkshareApplicationId = extra.linkshareApplicationId || '';
      configs.linkshareAffiliateId = extra.linkshareAffiliateId || '';
      configs.a8NetApiKey = extra.a8NetApiKey || '';
      configs.rakutenAppId = extra.rakutenAppId || '';
      configs.rakutenAffiliateId = extra.rakutenAffiliateId || '';
      configs.rakutenAppSecret = extra.rakutenAppSecret || '';
      configs.version = Constants.manifest?.version || Constants.expoConfig?.version || '1.0.0';
    } catch (e) {
      // エラーは無視
    }
  }
  
  // 環境変数から直接取得を試みる
  configs.linkshareApiToken = configs.linkshareApiToken || process.env.EXPO_PUBLIC_LINKSHARE_API_TOKEN || '';
  configs.linkshareMerchantId = configs.linkshareMerchantId || process.env.EXPO_PUBLIC_LINKSHARE_MERCHANT_ID || '';
  configs.linkshareApplicationId = configs.linkshareApplicationId || process.env.EXPO_PUBLIC_LINKSHARE_APPLICATION_ID || '';
  configs.linkshareAffiliateId = configs.linkshareAffiliateId || process.env.EXPO_PUBLIC_LINKSHARE_AFFILIATE_ID || '';
  configs.a8NetApiKey = configs.a8NetApiKey || process.env.EXPO_PUBLIC_A8_NET_API_KEY || '';
  configs.rakutenAppId = configs.rakutenAppId || process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || '';
  configs.rakutenAffiliateId = configs.rakutenAffiliateId || process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || '';
  configs.rakutenAppSecret = configs.rakutenAppSecret || process.env.EXPO_PUBLIC_RAKUTEN_APP_SECRET || '';
  
  return configs;
};

const apiConfigs = getApiConfigs();

export const LINKSHARE_API_KEY = apiConfigs.linkshareApiToken;
export const LINKSHARE_API_TOKEN = LINKSHARE_API_KEY; // エイリアス for backward compatibility
export const LINKSHARE_MERCHANT_ID = apiConfigs.linkshareMerchantId;
export const LINKSHARE_APPLICATION_ID = apiConfigs.linkshareApplicationId;
export const LINKSHARE_AFFILIATE_ID = apiConfigs.linkshareAffiliateId;
export const A8_NET_API_KEY = apiConfigs.a8NetApiKey;
export const RAKUTEN_APP_ID = apiConfigs.rakutenAppId;
export const RAKUTEN_AFFILIATE_ID = apiConfigs.rakutenAffiliateId;
export const RAKUTEN_APP_SECRET = apiConfigs.rakutenAppSecret;

// アプリ設定
export const APP_VERSION = apiConfigs.version;

// ログレベル設定
export const LOG_LEVEL = IS_DEV ? 'debug' : 'error';

// デバッグ用関数
export const validateEnvVars = () => {
  const requiredVars = [
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY }
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0 && IS_DEV) {
    // console.logはコンポーネントのライフサイクル内でのみ使用
    setTimeout(() => {
      console.error('Missing required environment variables:', missingVars.map(v => v.name));
    }, 0);
    return false;
  }

  return true;
};

// デバッグ情報の表示（コンポーネントから呼び出される場合のみ）
export const logEnvironmentInfo = () => {
  if (IS_DEV) {
    console.log('[ENV] Environment Variables Loaded:');
    console.log('- SUPABASE_URL:', SUPABASE_URL);
    console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.log('- RAKUTEN_APP_ID:', RAKUTEN_APP_ID ? 'Set' : 'Missing');
    console.log('- RAKUTEN_AFFILIATE_ID:', RAKUTEN_AFFILIATE_ID ? 'Set' : 'Missing');
    console.log('- APP_VERSION:', APP_VERSION);
    console.log('- IS_DEV:', IS_DEV);
    console.log('- Constants:', Constants ? 'Loaded' : 'Not loaded');
  }
};
