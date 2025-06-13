// Supabaseダッシュボードで実行するSQLを生成するスクリプト（修正版）

const sampleProducts = [
  {
    name: "ベーシックTシャツ",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    price: 2980,
    brand: "UNIQLO",
    category: "メンズファッション",
    tags: ["カジュアル", "ベーシック", "Tシャツ"],
    description: "シンプルで使いやすいベーシックなTシャツ"
  },
  {
    name: "フローラルワンピース",
    image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400",
    price: 5980,
    brand: "ZARA",
    category: "レディースファッション",
    tags: ["フェミニン", "ワンピース", "花柄"],
    description: "華やかな花柄のワンピース"
  },
  {
    name: "デニムジャケット",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
    price: 7980,
    brand: "Levi's",
    category: "メンズファッション",
    tags: ["カジュアル", "デニム", "アウター"],
    description: "定番のデニムジャケット"
  },
  {
    name: "レザーバッグ",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    price: 12800,
    brand: "Coach",
    category: "レディースバッグ",
    tags: ["レザー", "バッグ", "高級"],
    description: "上質なレザーを使用したバッグ"
  },
  {
    name: "スニーカー",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    price: 8900,
    brand: "Nike",
    category: "メンズ靴",
    tags: ["スポーツ", "カジュアル", "スニーカー"],
    description: "快適な履き心地のスニーカー"
  },
  {
    name: "シルクスカーフ",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    price: 4500,
    brand: "Hermès",
    category: "アクセサリー",
    tags: ["シルク", "スカーフ", "高級"],
    description: "エレガントなシルクスカーフ"
  },
  {
    name: "ストライプシャツ",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    price: 3980,
    brand: "GAP",
    category: "メンズファッション",
    tags: ["ビジネス", "シャツ", "ストライプ"],
    description: "ビジネスにも使えるストライプシャツ"
  },
  {
    name: "ニットセーター",
    image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400",
    price: 6980,
    brand: "H&M",
    category: "レディースファッション",
    tags: ["ニット", "セーター", "暖かい"],
    description: "柔らかく暖かいニットセーター"
  },
  {
    name: "チノパンツ",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    price: 4980,
    brand: "Banana Republic",
    category: "メンズファッション",
    tags: ["チノ", "パンツ", "カジュアル"],
    description: "どんなスタイルにも合うチノパンツ"
  },
  {
    name: "パンプス",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    price: 7980,
    brand: "Jimmy Choo",
    category: "レディース靴",
    tags: ["パンプス", "エレガント", "フォーマル"],
    description: "エレガントなパンプス"
  },
  // 追加商品
  {
    name: "モノトーンパーカー",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
    price: 4980,
    brand: "Supreme",
    category: "メンズファッション",
    tags: ["ストリート", "パーカー", "モノトーン"],
    description: "シンプルなモノトーンパーカー"
  },
  {
    name: "プリーツスカート",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400",
    price: 3980,
    brand: "GU",
    category: "レディースファッション",
    tags: ["フェミニン", "スカート", "プリーツ"],
    description: "動きやすいプリーツスカート"
  },
  {
    name: "レザージャケット",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    price: 19800,
    brand: "Schott",
    category: "メンズファッション",
    tags: ["レザー", "ジャケット", "クール"],
    description: "本格的なレザージャケット"
  },
  {
    name: "トートバッグ",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    price: 6980,
    brand: "L.L.Bean",
    category: "レディースバッグ",
    tags: ["トート", "カジュアル", "大容量"],
    description: "たっぷり入るトートバッグ"
  },
  {
    name: "ローファー",
    image: "https://images.unsplash.com/photo-1626379801357-1342833de91f?w=400",
    price: 12800,
    brand: "G.H.Bass",
    category: "メンズ靴",
    tags: ["ローファー", "クラシック", "革靴"],
    description: "クラシックなローファー"
  }
];

console.log('-- Stilya商品データ挿入SQL（修正版）');
console.log('-- Supabaseダッシュボードの SQL Editor で実行してください\n');

// RLS無効化
console.log('-- 1. RLSを一時的に無効化（必須）');
console.log('ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;');
console.log('');

// RLSポリシーを修正（全ユーザーが読み取り可能に）
console.log('-- 2. RLSポリシーを修正（anonユーザーも読み取り可能に）');
console.log('DROP POLICY IF EXISTS "Allow read access to all users" ON external_products;');
console.log('CREATE POLICY "Allow public read access" ON external_products');
console.log('  FOR SELECT TO public USING (is_active = true);');
console.log('');

// 既存データをクリア（オプション）
console.log('-- 3. 既存データをクリア（オプション）');
console.log('-- DELETE FROM external_products;');
console.log('');

// データ挿入（IDを明示的に指定）
console.log('-- 4. サンプル商品データを挿入（IDを明示的に指定）');
sampleProducts.forEach((product, index) => {
  const id = `sample_${index + 1}_${Date.now()}`; // ユニークなIDを生成
  const title = product.name.replace(/'/g, "''");
  const description = (product.description || '').replace(/'/g, "''");
  const tags = product.tags ? `ARRAY[${product.tags.map(tag => `'${tag}'`).join(', ')}]` : 'ARRAY[]::text[]';
  const affiliateUrl = `https://example.com/product/${index + 1}`;
  
  console.log(`INSERT INTO external_products (id, title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES (
  '${id}',
  '${title}', 
  '${product.image}', 
  ${product.price}, 
  '${product.brand}', 
  '${product.category}', 
  ${tags}, 
  '${description}', 
  '${affiliateUrl}', 
  'sample_data', 
  true
);`);
  console.log('');
});

// RLSを再度有効化
console.log('-- 5. RLSを再度有効化');
console.log('ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;');
console.log('');

// 確認クエリ
console.log('-- 6. 挿入結果を確認');
console.log('SELECT COUNT(*) as total_products FROM external_products;');
console.log('SELECT id, title, price, brand FROM external_products LIMIT 5;');
console.log('');

console.log('/*');
console.log('注意事項:');
console.log('1. external_productsテーブルのidはTEXT型のため、明示的に指定しています');
console.log('2. RLSポリシーを修正して、anonユーザーでも読み取り可能にしています');
console.log('3. 実行前後でRLSの状態を適切に管理してください');
console.log('4. 本番環境では適切なRLSポリシーを設定してください');
console.log('*/');
