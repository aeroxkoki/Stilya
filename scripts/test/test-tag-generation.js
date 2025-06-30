#!/usr/bin/env node
/**
 * タグ生成ロジックのテストスクリプト
 */

// タグ生成ロジックをテスト
function generateProductTags(product, brand) {
  const tags = new Set();
  const searchText = `${product.title} ${product.catchCopy} ${product.itemCaption}`.toLowerCase();
  
  // スタイルタグ
  const styleKeywords = {
    'カジュアル': ['カジュアル', 'デイリー', 'ラフ', '普段着'],
    'フェミニン': ['フェミニン', 'ガーリー', '女性らしい', 'レディライク'],
    'モード': ['モード', 'モダン', 'アート', '個性的'],
    'ナチュラル': ['ナチュラル', 'リネン', 'オーガニック', 'ゆったり'],
    'エレガント': ['エレガント', '上品', 'クラシック', 'フォーマル'],
    'ストリート': ['ストリート', 'ヒップホップ', 'スケーター'],
    'きれいめ': ['きれいめ', 'オフィス', 'コンサバ', 'OL']
  };
  
  // アイテムカテゴリタグ
  const itemKeywords = {
    'トップス': ['ブラウス', 'シャツ', 'ニット', 'カットソー', 'Tシャツ'],
    'ボトムス': ['スカート', 'パンツ', 'デニム', 'ショートパンツ'],
    'ワンピース': ['ワンピース', 'ドレス', 'オールインワン'],
    'アウター': ['コート', 'ジャケット', 'ブルゾン', 'カーディガン']
  };
  
  // 季節タグ
  const seasonKeywords = {
    '春夏': ['春', '夏', '半袖', '薄手', 'サマー', 'クール'],
    '秋冬': ['秋', '冬', '長袖', '厚手', 'ウィンター', 'ウォーム']
  };
  
  // マッチング処理
  Object.entries(styleKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      tags.add(tag);
    }
  });
  
  Object.entries(itemKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      tags.add(tag);
    }
  });
  
  // 現在の季節に応じたタグ
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 8) {
    if (seasonKeywords['春夏'].some(keyword => searchText.includes(keyword))) {
      tags.add('春夏');
    }
  } else {
    if (seasonKeywords['秋冬'].some(keyword => searchText.includes(keyword))) {
      tags.add('秋冬');
    }
  }
  
  // ブランド固有タグ
  if (brand.tags) {
    brand.tags.forEach(tag => tags.add(tag));
  }
  
  // 価格帯タグ
  if (product.price < 3000) tags.add('プチプラ');
  else if (product.price < 10000) tags.add('ミドルプライス');
  else if (product.price < 30000) tags.add('ハイプライス');
  else tags.add('ラグジュアリー');
  
  return Array.from(tags);
}

// テストケース
const testProducts = [
  {
    title: '【UNIQLO】カジュアルブラウス 春夏コレクション',
    catchCopy: '普段着に最適な薄手素材',
    itemCaption: 'リラックスフィットで着心地抜群。オフィスカジュアルにも対応可能な万能アイテム。',
    price: 2990
  },
  {
    title: 'フェミニンワンピース',
    catchCopy: '女性らしいエレガントなデザイン',
    itemCaption: '上品な仕上がりで、パーティーやデートに最適。高品質な素材を使用。',
    price: 15800
  },
  {
    title: 'ストリートパーカー',
    catchCopy: 'ヒップホップスタイルの定番',
    itemCaption: '厚手の生地で秋冬シーズンに活躍。スケーターファッションにぴったり。',
    price: 5980
  }
];

const testBrand = {
  name: 'UNIQLO',
  tags: ['ベーシック', 'シンプル', '定番']
};

// テスト実行
console.log('🧪 タグ生成ロジックのテスト\n');

testProducts.forEach((product, index) => {
  const tags = generateProductTags(product, testBrand);
  console.log(`テストケース ${index + 1}:`);
  console.log(`商品名: ${product.title}`);
  console.log(`価格: ¥${product.price.toLocaleString()}`);
  console.log(`生成されたタグ: ${tags.join(', ')}`);
  console.log('---\n');
});

// 品質スコア計算のテスト
function calculateProductQualityScore(product) {
  let score = 50; // ベーススコア
  
  // 画像品質（高解像度URL使用で加点）
  if (product.imageUrl && product.imageUrl.includes('_ex=800x800')) {
    score += 10;
  }
  
  // 説明の充実度
  const descLength = (product.itemCaption || '').length;
  if (descLength > 100) score += 10;
  if (descLength > 300) score += 10;
  
  // レビュースコア
  if (product.reviewAverage >= 4.0) score += 15;
  if (product.reviewCount >= 50) score += 10;
  if (product.reviewCount >= 100) score += 10;
  
  // 在庫状況
  if (product.availability === 1) score += 5;
  
  return Math.min(score, 100); // 最大100点
}

console.log('🧪 品質スコア計算のテスト\n');

const qualityTestProducts = [
  {
    imageUrl: 'https://example.com/image_ex=800x800.jpg',
    itemCaption: '高品質な商品です。' + '詳細な説明'.repeat(20),
    reviewAverage: 4.5,
    reviewCount: 120,
    availability: 1
  },
  {
    imageUrl: 'https://example.com/image.jpg',
    itemCaption: '短い説明',
    reviewAverage: 3.5,
    reviewCount: 10,
    availability: 0
  }
];

qualityTestProducts.forEach((product, index) => {
  const score = calculateProductQualityScore(product);
  console.log(`テストケース ${index + 1}:`);
  console.log(`品質スコア: ${score}/100`);
  console.log(`説明文長: ${product.itemCaption.length}文字`);
  console.log(`レビュー: ${product.reviewAverage}点 (${product.reviewCount}件)`);
  console.log('---\n');
});

console.log('✅ テスト完了');
