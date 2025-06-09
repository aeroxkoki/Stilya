const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// .envファイルを読み込み
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

// Supabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サンプル商品データ
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
  }
];

async function insertProductData() {
  console.log('🚀 商品データの挿入を開始します...');
  console.log('📊 挿入する商品数:', sampleProducts.length);

  try {
    // まずテーブルの状態を確認
    const { data: testData, error: testError } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ external_productsテーブルへのアクセスエラー:', testError.message);
      console.log('\n📝 以下のSQLをSupabaseのダッシュボードで実行してください:\n');
      
      // RLS無効化のSQL
      console.log('-- 1. RLSを無効化');
      console.log('ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;');
      console.log('');
      
      // データ挿入のSQL
      console.log('-- 2. サンプルデータを挿入');
      sampleProducts.forEach((product, index) => {
        const title = product.name.replace(/'/g, "''");
        const description = (product.description || '').replace(/'/g, "''");
        const tags = product.tags ? `ARRAY[${product.tags.map(tag => `'${tag}'`).join(', ')}]` : 'ARRAY[]::text[]';
        const affiliateUrl = `https://example.com/product/${index + 1}`;
        
        console.log(`INSERT INTO external_products (title, image_url, price, brand, category, tags, description, affiliate_url, source, is_active)
VALUES ('${title}', '${product.image}', ${product.price}, '${product.brand}', '${product.category}', 
${tags}, '${description}', '${affiliateUrl}', 'sample_data', true);`);
        console.log('');
      });
      
      return;
    }

    // データの挿入を試行
    const productsToInsert = sampleProducts.map((product, index) => ({
      title: product.name,
      image_url: product.image,
      price: product.price,
      brand: product.brand,
      category: product.category,
      tags: product.tags || [],
      description: product.description || '',
      affiliate_url: `https://example.com/product/${index + 1}`,
      source: 'sample_data',
      is_active: true
    }));

    // 一括挿入
    const { data, error } = await supabase
      .from('external_products')
      .insert(productsToInsert)
      .select();

    if (error) {
      console.error('❌ 商品挿入エラー:', error.message);
      console.log('\n💡 Supabaseダッシュボードで以下を確認してください:');
      console.log('1. external_productsテーブルのRLSが無効になっているか');
      console.log('2. テーブルの列定義が正しいか');
      console.log('3. 認証トークンが有効か');
    } else {
      console.log(`✅ ${data.length}件の商品データを挿入しました！`);
      
      // 挿入結果を確認
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 external_productsテーブルの総商品数: ${count}`);
      console.log('\n✅ データ挿入が完了しました！');
      console.log('📱 アプリを再起動して商品を確認してください。');
    }

  } catch (error) {
    console.error('❌ 予期しないエラーが発生しました:', error);
  }
}

// 実行
insertProductData();
