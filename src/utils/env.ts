// import Constants from 'expo-constants';

// Expoの環境変数取得
// app.config.js または app.json の extra フィールドに設定した値を取得
interface ExpoConfig {
  expoConfig?: {
    extra?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      linkshareApiToken?: string;
      linkshareMerchantId?: string;
      rakutenAppId?: string;
      rakutenAffiliateId?: string;
    };
  };
}

// モック用の設定
const mockExpoConstants = {
  expoConfig: {
    extra: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://ddypgpljprljqrblpuli.supabase.co',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU',
      linkshareApiToken: process.env.LINKSHARE_API_TOKEN || 'your_linkshare_token',
      linkshareMerchantId: process.env.LINKSHARE_MERCHANT_ID || 'your_merchant_id',
      rakutenAppId: process.env.RAKUTEN_APP_ID || 'your_rakuten_app_id',
      rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID || 'your_rakuten_affiliate_id',
    }
  }
};

// Expoの環境変数から取得
const getExpoConstant = (key: string): string | undefined => {
  // CI環境ではmockを使用
  const config = mockExpoConstants as unknown as ExpoConfig;
  return config?.expoConfig?.extra?.[key as keyof typeof mockExpoConstants.expoConfig.extra];
};

// 環境変数関連の処理
export const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  // 優先順位: Expo Constants > process.env
  const expoValue = getExpoConstant(key);
  if (expoValue) return expoValue;

  // process.envからの取得 (Reactの場合はREACT_APP_プレフィックスが必要)
  const envKey = `REACT_APP_${key}`;
  if (process.env && process.env[envKey]) return process.env[envKey] as string;
  
  // クライアントサイドでは環境変数が取得できない場合がある
  return defaultValue;
};

// Supabase関連の環境変数
// テスト環境とプロダクション環境で適切なURLを設定
export const SUPABASE_URL = getEnvVariable('SUPABASE_URL', process.env.NODE_ENV === 'test' ? 'https://test-supabase.com' : 'https://ddypgpljprljqrblpuli.supabase.co');
export const SUPABASE_ANON_KEY = getEnvVariable('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU');

// LinkShare API関連の環境変数
export const LINKSHARE_API_TOKEN = getEnvVariable('LINKSHARE_API_TOKEN', 'your_linkshare_token');
export const LINKSHARE_MERCHANT_ID = getEnvVariable('LINKSHARE_MERCHANT_ID', 'your_merchant_id');

// 楽天アフィリエイトAPI関連の環境変数
export const RAKUTEN_APP_ID = getEnvVariable('RAKUTEN_APP_ID', 'your_rakuten_app_id');
export const RAKUTEN_AFFILIATE_ID = getEnvVariable('RAKUTEN_AFFILIATE_ID', 'your_rakuten_affiliate_id');
