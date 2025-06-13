#!/usr/bin/env node
/**
 * タグ抽出の精度テストスクリプト
 * 新旧のタグ抽出方法を比較
 */

const { extractEnhancedTags } = require('./enhanced-tag-extractor');

// 旧バージョンのタグ抽出（比較用）
function extractOldTags(product) {
  const tags = [];
  const itemName = product.itemName || '';
  const keywords = {
    'ワンピース': 'ワンピース',
    'シャツ': 'シャツ',
    'ブラウス': 'ブラウス',
    'スカート': 'スカート',
    'パンツ': 'パンツ',
    'ジャケット': 'ジャケット',
    'コート': 'コート',
    'ニット': 'ニット',
    'カーディガン': 'カーディガン',
    'Tシャツ': 'Tシャツ',
    'デニム': 'デニム',
    'カジュアル': 'カジュアル',
    'フォーマル': 'フォーマル',
    'オフィス': 'オフィス'
  };

  Object.entries(keywords).forEach(([key, tag]) => {
    if (itemName.includes(key)) {
      tags.push(tag);
    }
  });

  tags.push('レディース');
  return [...new Set(tags)];
}

// テスト商品データ
const testProducts = [
  {
    itemName: '【送料無料】花柄シフォンワンピース ロング丈 春夏 レディース エレガント',
    itemPrice: 3980,
    shopName: 'Re:EDIT',
    itemCaption: '軽やかなシフォン素材で作られた、春夏にぴったりのワンピース。繊細な花柄プリントが女性らしさを演出。',
    genreId: '100371'
  },
  {
    itemName: 'オーバーサイズデニムジャケット Gジャン ヴィンテージ加工 ユニセックス',
    itemPrice: 6800,
    shopName: 'BEAMS',
    itemCaption: 'トレンドのオーバーサイズシルエット。ヴィンテージ加工を施したこなれ感のあるデニムジャケット。',
    genreId: '100371'
  },
  {
    itemName: 'ニットカーディガン ウール混 秋冬 オフィスカジュアル きれいめ',
    itemPrice: 12800,
    shopName: 'UNITED ARROWS',
    itemCaption: '上質なウール混素材を使用。オフィスでも使えるきれいめデザインのカーディガン。',
    genreId: '100371'
  },
  {
    itemName: '【プチプラ】ボーダーTシャツ コットン100% カジュアル 春夏',
    itemPrice: 1990,
    shopName: 'GU',
    itemCaption: 'ベーシックなボーダー柄のTシャツ。肌触りの良いコットン100%素材。',
    genreId: '100371'
  },
  {
    itemName: 'レザーハンドバッグ 本革 2way ショルダー付き ブラック',
    itemPrice: 28000,
    shopName: 'Coach',
    itemCaption: '上質な本革を使用した高級感のあるハンドバッグ。ショルダーストラップ付きで2way仕様。',
    genreId: '100371'
  }
];

// テスト実行
console.log('🧪 タグ抽出精度テスト\n');
console.log('=' .repeat(80));

testProducts.forEach((product, index) => {
  console.log(`\n【テスト ${index + 1}】`);
  console.log(`商品名: ${product.itemName}`);
  console.log(`価格: ¥${product.itemPrice.toLocaleString()}`);
  console.log(`ブランド: ${product.shopName}`);
  
  // 旧方式でタグ抽出
  const oldTags = extractOldTags(product);
  console.log(`\n旧方式タグ (${oldTags.length}個):`);
  console.log(`  ${oldTags.join(', ')}`);
  
  // 新方式でタグ抽出
  const newTags = extractEnhancedTags(product);
  console.log(`\n新方式タグ (${newTags.length}個):`);
  console.log(`  ${newTags.join(', ')}`);
  
  // 改善点の分析
  const addedTags = newTags.filter(tag => !oldTags.includes(tag));
  if (addedTags.length > 0) {
    console.log(`\n✨ 新規追加されたタグ (${addedTags.length}個):`);
    console.log(`  ${addedTags.join(', ')}`);
  }
  
  console.log('\n' + '-'.repeat(80));
});

// 統計サマリー
console.log('\n📊 精度向上の統計サマリー\n');

const totalOldTags = testProducts.reduce((sum, p) => sum + extractOldTags(p).length, 0);
const totalNewTags = testProducts.reduce((sum, p) => sum + extractEnhancedTags(p).length, 0);
const avgOldTags = (totalOldTags / testProducts.length).toFixed(1);
const avgNewTags = (totalNewTags / testProducts.length).toFixed(1);

console.log(`旧方式: 平均 ${avgOldTags} タグ/商品`);
console.log(`新方式: 平均 ${avgNewTags} タグ/商品`);
console.log(`改善率: ${((totalNewTags / totalOldTags - 1) * 100).toFixed(0)}% 増加`);

// タグカテゴリ別の分析
console.log('\n📈 新方式で追加されるタグの種類:');
const allNewTags = new Set();
testProducts.forEach(product => {
  const oldTags = extractOldTags(product);
  const newTags = extractEnhancedTags(product);
  const addedTags = newTags.filter(tag => !oldTags.includes(tag));
  addedTags.forEach(tag => allNewTags.add(tag));
});

const tagCategories = {
  '価格帯': ['プチプラ', 'ミドルプライス', 'ハイプライス'],
  'スタイル': ['エレガント', 'きれいめ', 'ヴィンテージ', 'モダン', 'トレンド'],
  '素材': ['シフォン', 'デニム素材', 'コットン', 'ウール', 'レザー'],
  'シルエット': ['オーバーサイズ', 'ロング丈'],
  '色・柄': ['花柄', 'ボーダー', 'ブラック'],
  'シーズン': ['春夏', '秋冬'],
  'その他': ['ファッション', 'トップス', 'アウター', 'バッグ']
};

Object.entries(tagCategories).forEach(([category, tags]) => {
  const foundTags = tags.filter(tag => allNewTags.has(tag));
  if (foundTags.length > 0) {
    console.log(`  ${category}: ${foundTags.join(', ')}`);
  }
});

console.log('\n✅ タグ精度テスト完了！');
console.log('新しいタグシステムにより、商品の特徴をより詳細に捉えることができます。');
