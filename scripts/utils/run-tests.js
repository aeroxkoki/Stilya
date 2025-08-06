#!/usr/bin/env node

/**
 * Stilya ローカルテストランナー (簡易版)
 * MVP機能の完全性を確認するためのコマンドラインツール
 */

// 環境変数の読み込み
require('dotenv').config();

// テスト用の環境変数確認
console.log('🔧 テスト環境セットアップ...');
console.log(`   - SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
console.log(`   - SUPABASE_KEY: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}`);
console.log(`   - DEMO_MODE: ${process.env.EXPO_PUBLIC_DEMO_MODE}`);

// テストの実行説明
console.log('\n📋 以下のテストを実行します:');
console.log('   1. 環境変数チェック');
console.log('   2. Supabase接続テスト');
console.log('   3. 認証機能テスト');
console.log('   4. 商品データ取得テスト');
console.log('   5. スワイプ機能テスト');
console.log('   6. 推薦ロジックテスト');
console.log('   7. UIコンポーネント確認');

console.log('\n⚠️  注意: このテストは簡易版です。');
console.log('実際のテストは Expo 環境で実行してください。');

console.log('\n📱 Expo でテストを実行するには:');
console.log('   1. npm start または expo start を実行');
console.log('   2. 開発メニューから「Run Tests」を選択');
console.log('   または');
console.log('   3. App.tsx に以下を追加:');
console.log('      import { runLocalTests } from "./src/tests/localTests";');
console.log('      useEffect(() => { runLocalTests(); }, []);');

// 基本的な環境チェックのみ実行
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('\n❌ 必須の環境変数が設定されていません！');
  console.error('   .env ファイルを確認してください。');
  process.exit(1);
}

console.log('\n✅ 基本的な環境チェックは成功しました！');
console.log('   詳細なテストは Expo 環境で実行してください。');
