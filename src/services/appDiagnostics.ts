/**
 * アプリケーション診断ツール
 * Expo Go環境でのエラー検出と解決を支援
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { supabase } from './supabase';
import { fetchProducts } from './productService';
import { runDatabaseDiagnostics, cleanupInvalidProducts } from '../utils/diagnostics';
import { fixMissingImageUrls, refreshAllProductData } from '../utils/fixImageUrls';
import { Platform } from 'react-native';

// Expo modulesの安全なインポート
let Constants: any = null;
let Device: any = null;

try {
  Constants = require('expo-constants').default;
} catch (error) {
  console.warn('[appDiagnostics] expo-constants not available');
}

try {
  Device = require('expo-device');
} catch (error) {
  console.warn('[appDiagnostics] expo-device not available');
}

export const runAppDiagnostics = async () => {
  console.log('🚀 Stilya App Diagnostics Starting...');
  console.log('====================================');
  
  // 1. 環境情報
  console.log('\n📱 環境情報:');
  console.log(`Platform: ${Platform.OS} ${Platform.Version}`);
  if (Device) {
    console.log(`Device: ${Device.brand} ${Device.modelName}`);
  }
  if (Constants) {
    console.log(`Expo SDK: ${Constants.expoVersion || 'Unknown'}`);
  }
  console.log(`Development: ${__DEV__ ? 'Yes' : 'No'}`);
  
  // 2. New Architecture状態
  console.log('\n🏗️ New Architecture:');
  // @ts-ignore
  const isNewArchEnabled = global.RN$TurboModuleRegistry !== undefined;
  // @ts-ignore
  const isFabricEnabled = global.nativeFabricUIManager !== undefined;
  console.log(`New Architecture: ${isNewArchEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`Fabric: ${isFabricEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  
  // 3. 環境変数の確認
  console.log('\n📋 環境変数チェック:');
  console.log('SUPABASE_URL:', SUPABASE_URL ? `✅ ${SUPABASE_URL}` : '❌ 未設定');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✅ ${SUPABASE_ANON_KEY.substring(0, 20)}...` : '❌ 未設定');
  
  // 4. モジュール検証
  console.log('\n📦 モジュール検証:');
  const requiredModules = [
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    '@supabase/supabase-js',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-gesture-handler',
    'react-native-reanimated',
  ];
  
  for (const moduleName of requiredModules) {
    try {
      require(moduleName);
      console.log(`✅ ${moduleName}`);
    } catch (error) {
      console.error(`❌ ${moduleName}: Failed to load`);
    }
  }
  
  // 5. Supabase接続テスト
  console.log('\n🔌 Supabase接続テスト:');
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ セッションエラー:', sessionError.message);
    } else {
      console.log('✅ 認証システム接続OK');
    }
    
    // 6. テーブルアクセステスト
    console.log('\n📊 テーブルアクセステスト:');
    
    // productsテーブル
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (productsError) {
      console.log('❌ productsテーブル:', productsError.message);
    } else {
      console.log('✅ productsテーブル: アクセス可能');
    }
    
    // 7. データベース診断を実行
    console.log('\n🔍 データベース診断:');
    await runDatabaseDiagnostics();
    
  } catch (error) {
    console.error('❌ Supabase接続エラー:', error);
  }
  
  // 8. メモリ使用状況（開発環境のみ）
  if (__DEV__) {
    console.log('\n💾 パフォーマンス:');
    // @ts-ignore
    if (global.performance && global.performance.memory) {
      // @ts-ignore
      const memory = global.performance.memory;
      console.log(`JS Heap Size: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`JS Heap Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  console.log('\n====================================');
  console.log('✅ 診断完了');
  console.log('====================================');
};

// エラーハンドラーのセットアップ
export const setupErrorHandlers = () => {
  if (__DEV__) {
    // グローバルエラーハンドラー
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('========================================');
      console.error('🚨 グローバルエラー検出');
      console.error('========================================');
      console.error(`Fatal: ${isFatal}`);
      console.error(`Error:`, error);
      
      if (error?.stack) {
        console.error('Stack Trace:');
        console.error(error.stack);
      }
      
      // 元のハンドラーを呼び出す
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
};

// 開発環境で自動実行
if (__DEV__) {
  // アプリ起動2秒後に診断を実行
  setTimeout(() => {
    console.log('[appDiagnostics] 診断を開始します...');
    runAppDiagnostics().catch(error => {
      console.error('[appDiagnostics] 診断中にエラー:', error);
    });
  }, 2000);
  
  // エラーハンドラーのセットアップ
  setupErrorHandlers();
}

export default {
  runAppDiagnostics,
  setupErrorHandlers,
};
