#!/usr/bin/env node

/**
 * データベース接続と商品読み込みの診断スクリプト
 * Supabaseへの接続と商品データの存在を確認します
 */

// dotenvを読み込む
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// 環境変数の設定
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ddypgpljprljqrblpuli.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

async function runDiagnostics() {
  console.log('🔍 Stilya データベース診断を開始します...\n');
  
  // 1. 環境変数チェック
  console.log('1️⃣ 環境変数チェック');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'Set (' + SUPABASE_ANON_KEY.length + ' chars)' : 'Missing'}`);
  
  if (!SUPABASE_ANON_KEY) {
    console.error('\n❌ エラー: SUPABASE_ANON_KEYが設定されていません');
    console.log('\n💡 解決方法:');
    console.log('1. Supabaseプロジェクトの設定画面からANON KEYを取得');
    console.log('2. .envファイルに以下を追加:');
    console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
    process.exit(1);
  }
  
  // Supabaseクライアント作成
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // 2. 接続テスト
    console.log('\n2️⃣ Supabase接続テスト');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ⚠️ 認証エラー: ${sessionError.message}`);
    } else {
      console.log('   ✅ Supabase接続成功');
    }
    
    // 3. external_productsテーブルの確認
    console.log('\n3️⃣ external_productsテーブルの確認');
    const { data: products, error: productsError, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .limit(10);
    
    if (productsError) {
      console.error(`   ❌ テーブルアクセスエラー: ${productsError.message}`);
      
      // エラーの詳細分析
      if (productsError.message.includes('relation') && productsError.message.includes('does not exist')) {
        console.log('\n💡 解決方法: テーブルが存在しません');
        console.log('1. Supabaseダッシュボードで以下のSQLを実行:');
        console.log(createTableSQL());
      } else if (productsError.message.includes('permission')) {
        console.log('\n💡 解決方法: RLS（Row Level Security）の設定が必要です');
        console.log('1. Supabaseダッシュボードで以下のSQLを実行:');
        console.log(createRLSSQL());
      }
    } else {
      console.log(`   ✅ テーブルアクセス成功（${count || 0}件の商品）`);
      
      if (count === 0) {
        console.log('\n⚠️ 商品データが存在しません');
        console.log('\n4️⃣ サンプル商品データの挿入');
        await insertSampleProducts(supabase);
      } else if (products && products.length > 0) {
        console.log('\n   商品サンプル:');
        products.slice(0, 3).forEach(p => {
          console.log(`   - ${p.title} (${p.brand}) - ¥${p.price}`);
        });
      }
    }
    
    // 4. 楽天APIからの商品取得テスト
    if (count === 0) {
      console.log('\n5️⃣ 楽天APIから商品を取得');
      await fetchAndInsertRakutenProducts(supabase);
    }
    
    console.log('\n✅ 診断完了');
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error);
  }
}

function createTableSQL() {
  return `
-- external_productsテーブルの作成
CREATE TABLE IF NOT EXISTS external_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  affiliate_url TEXT NOT NULL,
  source TEXT DEFAULT 'rakuten',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 999,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_external_products_active ON external_products(is_active);
CREATE INDEX IF NOT EXISTS idx_external_products_priority ON external_products(priority);
CREATE INDEX IF NOT EXISTS idx_external_products_category ON external_products(category);
CREATE INDEX IF NOT EXISTS idx_external_products_tags ON external_products USING gin(tags);
`;
}

function createRLSSQL() {
  return `
-- RLS（Row Level Security）の設定
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシーの作成（すべてのユーザーが商品を閲覧可能）
CREATE POLICY "Allow public read access" ON external_products
  FOR SELECT
  USING (true);

-- 管理者のみ書き込み可能（オプション）
CREATE POLICY "Allow authenticated users to insert" ON external_products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
`;
}

async function insertSampleProducts(supabase) {
  const sampleProducts = [
    {
      id: 'sample_001_' + Date.now(),
      title: 'オーバーサイズTシャツ',
      brand: 'UNIQLO',
      price: 2990,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      description: 'ゆったりとしたシルエットのTシャツ',
      tags: ['カジュアル', 'ユニセックス', 'コットン', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www.uniqlo.com/',
      source: 'manual',
      priority: 1
    },
    {
      id: 'sample_002_' + Date.now(),
      title: 'スキニーデニムパンツ',
      brand: 'ZARA',
      price: 5990,
      image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400',
      description: 'スリムフィットのデニムパンツ',
      tags: ['カジュアル', 'デニム', 'ストレッチ', 'ボトムス'],
      category: 'ボトムス',
      affiliate_url: 'https://www.zara.com/',
      source: 'manual',
      priority: 2
    },
    {
      id: 'sample_003_' + Date.now(),
      title: 'プリーツスカート',
      brand: 'GU',
      price: 2490,
      image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
      description: 'エレガントなプリーツスカート',
      tags: ['フェミニン', 'オフィス', 'プリーツ', 'スカート'],
      category: 'スカート',
      affiliate_url: 'https://www.gu-global.com/',
      source: 'manual',
      priority: 3
    },
    {
      id: 'sample_004_' + Date.now(),
      title: 'ニットセーター',
      brand: 'H&M',
      price: 3990,
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
      description: '暖かいウールブレンドのニットセーター',
      tags: ['カジュアル', 'ニット', '秋冬', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www2.hm.com/',
      source: 'manual',
      priority: 4
    },
    {
      id: 'sample_005_' + Date.now(),
      title: 'ワイドパンツ',
      brand: 'UNIQLO',
      price: 3990,
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      description: 'ゆったりとしたシルエットのワイドパンツ',
      tags: ['カジュアル', 'ワイド', 'コンフォート', 'ボトムス'],
      category: 'ボトムス',
      affiliate_url: 'https://www.uniqlo.com/',
      source: 'manual',
      priority: 5
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('external_products')
      .insert(sampleProducts);
    
    if (error) {
      console.error('   ❌ サンプルデータの挿入エラー:', error.message);
      
      // 既存データの削除を試みる
      if (error.message.includes('duplicate key')) {
        console.log('   重複エラーのため、既存データを削除して再試行...');
        const { error: deleteError } = await supabase
          .from('external_products')
          .delete()
          .like('id', 'sample_%');
        
        if (!deleteError) {
          // 再度挿入
          const { error: retryError } = await supabase
            .from('external_products')
            .insert(sampleProducts);
          
          if (retryError) {
            console.error('   ❌ 再挿入エラー:', retryError.message);
          } else {
            console.log('   ✅ サンプル商品データを挿入しました');
          }
        }
      }
    } else {
      console.log('   ✅ サンプル商品データを挿入しました');
    }
  } catch (error) {
    console.error('   ❌ 挿入中のエラー:', error);
  }
}

async function fetchAndInsertRakutenProducts(supabase) {
  const RAKUTEN_APP_ID = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID;
  const RAKUTEN_AFFILIATE_ID = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID;
  
  if (!RAKUTEN_APP_ID) {
    console.log('   ⚠️ 楽天APIキーが設定されていないため、スキップします');
    return;
  }
  
  try {
    console.log('   楽天APIから商品を取得中...');
    
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&genreId=100371&applicationId=${RAKUTEN_APP_ID}&affiliateId=${RAKUTEN_AFFILIATE_ID}&hits=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.Items && data.Items.length > 0) {
      const products = data.Items.map((item, index) => {
        const rakutenItem = item.Item || item;
        return {
          id: `rakuten_${rakutenItem.itemCode}_${Date.now()}_${index}`,
          title: rakutenItem.itemName.substring(0, 100),
          brand: rakutenItem.shopName || 'Unknown',
          price: rakutenItem.itemPrice,
          image_url: rakutenItem.mediumImageUrls?.[0]?.imageUrl || rakutenItem.smallImageUrls?.[0]?.imageUrl || '',
          description: rakutenItem.itemCaption?.substring(0, 500) || '',
          tags: extractTags(rakutenItem.itemName),
          category: 'ファッション',
          affiliate_url: rakutenItem.affiliateUrl || rakutenItem.itemUrl,
          source: 'rakuten',
          is_active: true,
          priority: 10 + index
        };
      });
      
      const { error } = await supabase
        .from('external_products')
        .insert(products);
      
      if (error) {
        console.error('   ❌ 楽天商品の挿入エラー:', error.message);
      } else {
        console.log(`   ✅ 楽天から${products.length}件の商品を挿入しました`);
      }
    }
  } catch (error) {
    console.error('   ❌ 楽天API取得エラー:', error);
  }
}

function extractTags(itemName) {
  const tags = [];
  
  // カテゴリータグ
  if (itemName.includes('Tシャツ') || itemName.includes('シャツ')) tags.push('トップス');
  if (itemName.includes('パンツ') || itemName.includes('ジーンズ')) tags.push('ボトムス');
  if (itemName.includes('スカート')) tags.push('スカート');
  if (itemName.includes('ワンピース')) tags.push('ワンピース');
  
  // スタイルタグ
  if (itemName.includes('カジュアル')) tags.push('カジュアル');
  if (itemName.includes('フォーマル') || itemName.includes('オフィス')) tags.push('オフィス');
  if (itemName.includes('ストリート')) tags.push('ストリート');
  
  // 素材タグ
  if (itemName.includes('コットン') || itemName.includes('綿')) tags.push('コットン');
  if (itemName.includes('デニム')) tags.push('デニム');
  if (itemName.includes('ニット')) tags.push('ニット');
  
  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('ファッション');
  }
  
  return tags;
}

// スクリプトの実行
runDiagnostics().catch(console.error);
