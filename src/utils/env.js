"use strict";
// import Constants from 'expo-constants';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAKUTEN_AFFILIATE_ID = exports.RAKUTEN_APP_ID = exports.LINKSHARE_MERCHANT_ID = exports.LINKSHARE_API_TOKEN = exports.SUPABASE_ANON_KEY = exports.SUPABASE_URL = exports.getEnvVariable = void 0;
// モック用の設定
var mockExpoConstants = {
    expoConfig: {
        extra: {
            supabaseUrl: process.env.SUPABASE_URL || 'your_supabase_url',
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key',
            linkshareApiToken: process.env.LINKSHARE_API_TOKEN || 'your_linkshare_token',
            linkshareMerchantId: process.env.LINKSHARE_MERCHANT_ID || 'your_merchant_id',
            rakutenAppId: process.env.RAKUTEN_APP_ID || 'your_rakuten_app_id',
            rakutenAffiliateId: process.env.RAKUTEN_AFFILIATE_ID || 'your_rakuten_affiliate_id',
        }
    }
};
// Expoの環境変数から取得
var getExpoConstant = function (key) {
    var _a, _b;
    // CI環境ではmockを使用
    var config = mockExpoConstants;
    return (_b = (_a = config === null || config === void 0 ? void 0 : config.expoConfig) === null || _a === void 0 ? void 0 : _a.extra) === null || _b === void 0 ? void 0 : _b[key];
};
// 環境変数関連の処理
var getEnvVariable = function (key, defaultValue) {
    if (defaultValue === void 0) { defaultValue = ''; }
    // 優先順位: Expo Constants > process.env
    var expoValue = getExpoConstant(key);
    if (expoValue)
        return expoValue;
    // process.envからの取得 (Reactの場合はREACT_APP_プレフィックスが必要)
    var envKey = "REACT_APP_".concat(key);
    if (process.env && process.env[envKey])
        return process.env[envKey];
    // クライアントサイドでは環境変数が取得できない場合がある
    return defaultValue;
};
exports.getEnvVariable = getEnvVariable;
// Supabase関連の環境変数
exports.SUPABASE_URL = (0, exports.getEnvVariable)('SUPABASE_URL', 'your_supabase_url');
exports.SUPABASE_ANON_KEY = (0, exports.getEnvVariable)('SUPABASE_ANON_KEY', 'your_supabase_anon_key');
// LinkShare API関連の環境変数
exports.LINKSHARE_API_TOKEN = (0, exports.getEnvVariable)('LINKSHARE_API_TOKEN', 'your_linkshare_token');
exports.LINKSHARE_MERCHANT_ID = (0, exports.getEnvVariable)('LINKSHARE_MERCHANT_ID', 'your_merchant_id');
// 楽天アフィリエイトAPI関連の環境変数
exports.RAKUTEN_APP_ID = (0, exports.getEnvVariable)('RAKUTEN_APP_ID', 'your_rakuten_app_id');
exports.RAKUTEN_AFFILIATE_ID = (0, exports.getEnvVariable)('RAKUTEN_AFFILIATE_ID', 'your_rakuten_affiliate_id');
