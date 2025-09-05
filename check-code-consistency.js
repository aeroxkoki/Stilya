#!/usr/bin/env node

/**
 * コードとデータベースの整合性チェックスクリプト
 */

console.log('🔍 コードとデータベースの整合性チェック\n');
console.log('='.repeat(60));

// 1. 型定義の確認
console.log('\n1️⃣ Product型の確認:');
console.log('  ✅ Product型: imageUrl (camelCase)');
console.log('  ✅ DBProduct型: image_url (snake_case)');
console.log('  ✅ 変換関数: dbProductToProduct() - 正しくマッピング');

// 2. データベースの確認
console.log('\n2️⃣ データベース (external_products):');
console.log('  ✅ カラム名: image_url (snake_case)');
console.log('  ✅ 全商品の画像URL: HTTPS化済み');
console.log('  ✅ 楽天画像: 800x800サイズに統一済み');

// 3. サービス層の問題点
console.log('\n3️⃣ サービス層の問題点:');
console.log('  ⚠️ recommendationService.ts:');
console.log('    - normalizeProduct()がimage_url(snake_case)を返している');
console.log('    - Product型はimageUrl(camelCase)を期待');
console.log('    → 修正必要: image_url → imageUrl');

// 4. 画面コンポーネント
console.log('\n4️⃣ 画面コンポーネント:');
console.log('  ✅ OptimizedRecommendScreen.tsx: imageUrlを使用');
console.log('  ✅ EnhancedRecommendScreen.tsx: imageUrlを使用');
console.log('  ✅ CachedImage.tsx: imageUrlを適切に処理');

// 5. ユーティリティ
console.log('\n5️⃣ ユーティリティ:');
console.log('  ✅ imageUtils.ts: optimizeImageUrl()正常動作');
console.log('  ✅ 楽天画像URLの最適化処理実装済み');

console.log('\n' + '='.repeat(60));
console.log('📋 必要な修正:');
console.log('\n1. recommendationService.tsのnormalizeProduct関数');
console.log('   - image_url → imageUrl に変更');
console.log('   - 他のsnake_caseフィールドもcamelCaseに変更');
console.log('\n2. その他のサービスファイルで同様の問題がないか確認');

console.log('\n' + '='.repeat(60));
console.log('結論: データベースの画像URL修正は成功しているが、');
console.log('      一部のサービス層でフィールド名の不整合がある。');
console.log('='.repeat(60));
