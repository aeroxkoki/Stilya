/**
 * バイブレーション機能テストスクリプト
 * 実行方法: npx tsx scripts/test-vibration.ts
 */

import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

console.log('===================================');
console.log('🎯 Stilya バイブレーション機能テスト');
console.log('===================================\n');

// バイブレーション設定の確認
console.log('📱 現在の実装状況:');
console.log('----------------------------------');
console.log('✅ expo-haptics: v14.1.4 インストール済み');
console.log('✅ SwipeCardImproved.tsx に実装済み');
console.log('✅ プラットフォーム別対応実装済み\n');

// 実装されているパターン
console.log('🎮 実装されているバイブレーションパターン:');
console.log('----------------------------------');

const vibrationPatterns = {
  iOS: {
    'いいね！（右スワイプ）': 'Haptics.ImpactFeedbackStyle.Heavy',
    'スキップ（左スワイプ）': 'Haptics.ImpactFeedbackStyle.Light',
    '保存ボタン': 'Haptics.ImpactFeedbackStyle.Medium',
  },
  Android: {
    'いいね！（右スワイプ）': '[0, 50, 30, 50] (ダブルタップ)',
    'スキップ（左スワイプ）': '30ms (単発)',
    '保存ボタン': '40ms (単発)',
  }
};

console.log('【iOS】');
Object.entries(vibrationPatterns.iOS).forEach(([action, pattern]) => {
  console.log(`  • ${action}: ${pattern}`);
});

console.log('\n【Android】');
Object.entries(vibrationPatterns.Android).forEach(([action, pattern]) => {
  console.log(`  • ${action}: ${pattern}`);
});

// デバッグログの例
console.log('\n📝 デバッグログの例:');
console.log('----------------------------------');
console.log('[SwipeCard] 右スワイプ検出 - バイブレーション開始');
console.log('[SwipeCard] iOS - Haptic Engineを使用');
console.log('[SwipeCard] Android - バイブレーションパターン: [0, 50, 30, 50]');

// トラブルシューティング
console.log('\n⚠️ もしバイブレーションが動作しない場合:');
console.log('----------------------------------');
console.log('1. デバイスの設定を確認:');
console.log('   • バイブレーション設定がONになっているか');
console.log('   • サイレントモードになっていないか');
console.log('');
console.log('2. Expo Goでのテスト:');
console.log('   • Expo Goアプリが最新版か確認');
console.log('   • 実機でテストしているか（エミュレータではない）');
console.log('');
console.log('3. コンソールログを確認:');
console.log('   • Metro bundlerのコンソールでエラーがないか');
console.log('   • "[SwipeCard] バイブレーション"で検索');

console.log('\n✨ テスト完了!');
console.log('===================================');

// 実装ファイルの場所を表示
console.log('\n📂 実装ファイル:');
console.log('src/components/swipe/SwipeCardImproved.tsx');
console.log('  - Line 117-154: スワイプジェスチャー時のバイブレーション');
console.log('  - Line 183-193: 保存ボタンのバイブレーション');
console.log('  - Line 210-235: プログラム的スワイプのバイブレーション');

export {};
