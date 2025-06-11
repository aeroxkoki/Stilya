#!/usr/bin/env node
/**
 * 既存商品のタグを高精度版で再生成するスクリプト
 * 540件の商品データに対して新しいタグシステムを適用
 */

const { createClient } = require('@supabase/supabase-js');
const { extractEnhancedTags } = require('./enhanced-tag-extractor');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 既存商品のタグを更新
 */
async function updateProductTags() {
  console.log('🚀 既存商品のタグ更新を開始します...\n');
  
  try {
    // 1. 全商品を取得
    console.log('📦 既存商品を取得中...');
    const { data: products, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`✅ ${products.length}件の商品を取得しました\n`);
    
    // 2. タグの更新統計を初期化
    const tagStats = new Map();
    let updatedCount = 0;
    let errorCount = 0;
    
    // 3. 各商品のタグを更新
    console.log('🏷️ タグを更新中...');
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      try {
        // 楽天API形式のオブジェクトに変換
        const rakutenProduct = {
          itemName: product.title,
          itemPrice: product.price,
          shopName: product.brand,
          itemCaption: product.description || '',
          itemCode: product.id,
          genreId: product.category
        };
        
        // 新しいタグを生成
        const newTags = extractEnhancedTags(rakutenProduct);
        
        // タグ統計を更新
        newTags.forEach(tag => {
          tagStats.set(tag, (tagStats.get(tag) || 0) + 1);
        });
        
        // データベースを更新
        const { error: updateError } = await supabase
          .from('external_products')
          .update({ 
            tags: newTags,
            last_synced: new Date().toISOString()
          })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`❌ 更新エラー (${product.id}):`, updateError.message);
          errorCount++;
        } else {
          updatedCount++;
          
          // 進捗表示（50件ごと）
          if ((i + 1) % 50 === 0) {
            console.log(`  進捗: ${i + 1}/${products.length} (${Math.round((i + 1) / products.length * 100)}%)`);
          }
        }
        
      } catch (err) {
        console.error(`❌ タグ生成エラー (${product.id}):`, err);
        errorCount++;
      }
    }
    
    // 4. 結果表示
    console.log('\n✅ タグ更新完了！');
    console.log(`  成功: ${updatedCount}件`);
    console.log(`  エラー: ${errorCount}件`);
    
    // 5. タグ統計を表示（上位20個）
    console.log('\n📊 タグ使用頻度（上位20）:');
    const sortedTags = Array.from(tagStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    sortedTags.forEach(([tag, count], index) => {
      console.log(`  ${index + 1}. ${tag}: ${count}件`);
    });
    
    // 6. サンプル商品の詳細表示
    console.log('\n🔍 サンプル商品（更新後）:');
    const sampleProducts = products.slice(0, 3);
    
    for (const product of sampleProducts) {
      const { data: updated } = await supabase
        .from('external_products')
        .select('title, tags')
        .eq('id', product.id)
        .single();
      
      if (updated) {
        console.log(`\n商品: ${updated.title}`);
        console.log(`タグ: ${updated.tags.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

/**
 * タグ分析レポート
 */
async function analyzeTagDistribution() {
  console.log('\n\n📈 タグ分析レポート\n');
  
  try {
    const { data: products } = await supabase
      .from('external_products')
      .select('tags')
      .eq('is_active', true);
    
    // カテゴリ別タグ集計
    const categoryStats = {
      itemType: new Map(),
      style: new Map(),
      color: new Map(),
      material: new Map(),
      season: new Map(),
      priceRange: new Map()
    };
    
    // タグカテゴリの判定
    const tagCategories = {
      itemType: ['ワンピース', 'シャツ', 'パンツ', 'スカート', 'ジャケット', 'ニット', 'バッグ', 'シューズ'],
      style: ['カジュアル', 'フォーマル', 'エレガント', 'ストリート', 'フェミニン', 'モード', 'ナチュラル'],
      color: ['ブラック', 'ホワイト', 'ネイビー', 'グレー', 'ベージュ', 'ブラウン', 'レッド', 'ブルー'],
      material: ['コットン', 'リネン', 'シルク', 'ウール', 'レザー', 'デニム', 'ニット素材'],
      season: ['春', '夏', '秋', '冬', 'オールシーズン'],
      priceRange: ['プチプラ', 'ミドルプライス', 'ハイプライス', 'ラグジュアリー']
    };
    
    // 集計
    products.forEach(product => {
      if (product.tags) {
        product.tags.forEach(tag => {
          Object.entries(tagCategories).forEach(([category, categoryTags]) => {
            if (categoryTags.some(catTag => tag.includes(catTag))) {
              categoryStats[category].set(tag, (categoryStats[category].get(tag) || 0) + 1);
            }
          });
        });
      }
    });
    
    // レポート出力
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.size > 0) {
        console.log(`\n【${category}】`);
        const sorted = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sorted.forEach(([tag, count]) => {
          console.log(`  ${tag}: ${count}件 (${Math.round(count / products.length * 100)}%)`);
        });
      }
    });
    
  } catch (error) {
    console.error('分析エラー:', error);
  }
}

// メイン処理
async function main() {
  // 既存商品のタグを更新
  await updateProductTags();
  
  // タグ分析レポートを表示
  await analyzeTagDistribution();
  
  console.log('\n✨ すべての処理が完了しました');
}

// 実行
main().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
