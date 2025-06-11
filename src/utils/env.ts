// 環境変数の管理
// Expo の Constants.expoConfig を使用して環境変数を安全に取得

import Constants from 'expo-constants';

// 開発環境判定
export const IS_DEV = process.env.NODE_ENV === 'development';

// Supabase設定（オンラインのみ）
const getSupabaseConfig = () => {
  // プロジェクトIDに基づく正しいURL
  const projectId = 'ddypgpljprljqrblpuli';
  
  const url = Constants.expoConfig?.extra?.supabaseUrl || 
              process.env.EXPO_PUBLIC_SUPABASE_URL || 
              `https://${projectId}.supabase.co`;
              
  const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                  '';
  
  if (IS_DEV) {
    console.log('[ENV] Using Supabase:', url);
  }
  
  return { url, anonKey };
};

const supabaseConfig = getSupabaseConfig();
export const SUPABASE_URL = supabaseConfig.url;
export const SUPABASE_ANON_KEY = supabaseConfig.anonKey;

// API設定
export const LINKSHARE_API_KEY = Constants.expoConfig?.extra?.linkshareApiToken || process.env.EXPO_PUBLIC_LINKSHARE_API_TOKEN || '';
export const LINKSHARE_API_TOKEN = LINKSHARE_API_KEY; // エイリアス for backward compatibility
export const LINKSHARE_MERCHANT_ID = Constants.expoConfig?.extra?.linkshareMerchantId || process.env.EXPO_PUBLIC_LINKSHARE_MERCHANT_ID || '';
export const LINKSHARE_APPLICATION_ID = Constants.expoConfig?.extra?.linkshareApplicationId || process.env.EXPO_PUBLIC_LINKSHARE_APPLICATION_ID || '';
export const LINKSHARE_AFFILIATE_ID = Constants.expoConfig?.extra?.linkshareAffiliateId || process.env.EXPO_PUBLIC_LINKSHARE_AFFILIATE_ID || '';
export const A8_NET_API_KEY = Constants.expoConfig?.extra?.a8NetApiKey || process.env.EXPO_PUBLIC_A8_NET_API_KEY || '';
export const RAKUTEN_APP_ID = Constants.expoConfig?.extra?.rakutenAppId || process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || '';
export const RAKUTEN_AFFILIATE_ID = Constants.expoConfig?.extra?.rakutenAffiliateId || process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || '';
export const RAKUTEN_APP_SECRET = Constants.expoConfig?.extra?.rakutenAppSecret || process.env.EXPO_PUBLIC_RAKUTEN_APP_SECRET || '';

// アプリ設定
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// ログレベル設定
export const LOG_LEVEL = IS_DEV ? 'debug' : 'error';

// デバッグ用関数
export const validateEnvVars = () => {
  const requiredVars = [
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY }
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.map(v => v.name));
    return false;
  }

  return true;
};

// デバッグ用: 環境変数の確認（開発環境のみ）
if (IS_DEV) {
  console.log('[ENV] Environment Variables Loaded:');
  console.log('- SUPABASE_URL:', SUPABASE_URL);
  console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  console.log('- APP_VERSION:', APP_VERSION);
  console.log('- IS_DEV:', IS_DEV);
}
