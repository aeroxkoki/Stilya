#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

// 必須環境変数チェック
const required = ['EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Get service key from Supabase Dashboard → Settings → API');
  process.exit(1);
}

// サービスロールキーで初期化（RLSバイパス）
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
  }
];

async function syncProducts() {
  console.log('🚀 Starting product sync with service role key...');
  
  try {
    // 1. データ変換
    const products = sampleProducts.map((p, i) => ({
      id: `prod_${Date.now()}_${i}`,
      title: p.name,
      image_url: p.image,
      price: p.price,
      brand: p.brand,
      category: p.category,
      tags: p.tags || [],
      description: p.description || '',
      affiliate_url: `https://example.com/product/${i}`,
      source: 'sample_data',
      is_active: true,
      last_synced: new Date().toISOString()
    }));
    
    // 2. バッチ挿入
    console.log(`📦 Inserting ${products.length} products...`);
    const { data, error } = await supabase
      .from('external_products')
      .upsert(products, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      console.error('❌ Insert error:', error);
      throw error;
    }
    
    console.log(`✅ Successfully inserted ${data?.length || 0} products`);
    
    // 3. 古いデータの無効化
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { error: updateError } = await supabase
      .from('external_products')
      .update({ is_active: false })
      .lt('last_synced', oneWeekAgo.toISOString())
      .eq('source', 'sample_data');
    
    if (updateError) {
      console.warn('⚠️ Failed to deactivate old products:', updateError);
    }
    
    // 4. 現在のデータ数を確認
    const { count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`📊 Total active products: ${count}`);
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('Make sure you have set SUPABASE_SERVICE_KEY in your .env file');
    process.exit(1);
  }
}

// 実行
syncProducts();
