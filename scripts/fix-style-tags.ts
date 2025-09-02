/**
 * Style Tags修正スクリプト
 * データベースの商品のstyle_tagsを、実際のtagsから再計算して更新します
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// .envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('環境変数 SUPABASE_URL と SUPABASE_ANON_KEY が必要です');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// スタイル優先度マップ（tagMappingServiceから移植）
const STYLE_PRIORITY_KEYWORDS: Record<string, Record<string, number>> = {
  casual: {
    'カジュアル': 3,
    'デイリー': 2,
    'ラフ': 2,
    'リラックス': 2,
    'アメカジ': 2,
    'デニム': 1,
    'Tシャツ': 1,
    'スニーカー': 1,
  },
  street: {
    'ストリート': 3,
    'スケーター': 2,
    'ヒップホップ': 2,
    'グラフィック': 1,
    'オーバーサイズ': 1,
    'キャップ': 1,
  },
  mode: {
    'モード': 3,
    'モダン': 2,
    'ミニマル': 2,
    'シンプル': 1,
    'モノトーン': 1,
    '黒': 1,
    'ブラック': 1,
  },
  natural: {
    'ナチュラル': 3,
    'オーガニック': 2,
    '自然': 2,
    'リネン': 1,
    'コットン': 1,
    'ベージュ': 1,
    'アース': 1,
  },
  classic: {
    'クラシック': 3,
    'きれいめ': 3,
    'オフィス': 2,
    'ビジネス': 2,
    'フォーマル': 2,
    'トラッド': 2,
    'コンサバ': 2,
    'エレガント': 2,
    'ジャケット': 1,
    'シャツ': 1,
    'ブラウス': 1,
    'ベーシック': 2, // basicタグもclassicにマッピング
    'basic': 2,
  },
  feminine: {
    'フェミニン': 3,
    'ガーリー': 2,
    'キュート': 2,
    'かわいい': 2,
    'ワンピース': 1,
    'スカート': 1,
    'フリル': 1,
    'レース': 1,
    'ピンク': 1,
  },
};

/**
 * 商品のタグからスタイルを判定
 */
function determineProductStyle(tags: string[], category?: string): string {
  if (!tags || tags.length === 0) return 'casual';
  
  const styleScores: Record<string, number> = {};
  
  tags.forEach(tag => {
    const normalizedTag = tag.trim();
    
    // 各スタイルのキーワードと照合
    Object.entries(STYLE_PRIORITY_KEYWORDS).forEach(([styleId, keywords]) => {
      Object.entries(keywords).forEach(([keyword, weight]) => {
        if (normalizedTag === keyword || normalizedTag.includes(keyword)) {
          styleScores[styleId] = (styleScores[styleId] || 0) + weight;
        }
      });
    });
  });
  
  // カテゴリによる補正
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('ワンピース') || categoryLower.includes('スカート')) {
      styleScores.feminine = (styleScores.feminine || 0) + 1;
    }
    if (categoryLower.includes('ジャケット') || categoryLower.includes('スーツ')) {
      styleScores.classic = (styleScores.classic || 0) + 1;
    }
    if (categoryLower.includes('パーカー') || categoryLower.includes('スウェット')) {
      styleScores.casual = (styleScores.casual || 0) + 1;
    }
  }
  
  // スコアが同じ場合の優先順位
  const stylePriority = ['classic', 'mode', 'feminine', 'natural', 'street', 'casual'];
  
  if (Object.keys(styleScores).length === 0) {
    // スコアがない場合、ベーシックタグがあればclassicに
    if (tags.some(tag => tag.toLowerCase() === 'basic' || tag === 'ベーシック')) {
      return 'classic';
    }
    return 'casual';
  }
  
  // 最高スコアを取得
  const maxScore = Math.max(...Object.values(styleScores));
  const topStyles = Object.entries(styleScores)
    .filter(([, score]) => score === maxScore)
    .map(([style]) => style);
  
  // 同スコアの場合は優先順位で決定
  for (const style of stylePriority) {
    if (topStyles.includes(style)) {
      return style;
    }
  }
  
  return topStyles[0] || 'casual';
}

/**
 * スタイルタグを修正
 */
async function fixStyleTags() {
  console.log('🔧 スタイルタグの修正を開始します...');
  
  try {
    // 1. 全ての有効な商品を取得
    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;
    let totalProcessed = 0;
    let totalUpdated = 0;
    
    while (hasMore) {
      console.log(`📦 商品を取得中... (offset: ${offset})`);
      
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, title, tags, category, style_tags')
        .eq('is_active', true)
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error('商品取得エラー:', error);
        break;
      }
      
      if (!products || products.length === 0) {
        hasMore = false;
        break;
      }
      
      console.log(`  ${products.length}件の商品を処理中...`);
      
      // 2. 各商品のstyle_tagsを再計算
      const updates = [];
      
      for (const product of products) {
        const currentStyleTag = product.style_tags?.[0];
        const newStyleTag = determineProductStyle(product.tags || [], product.category);
        
        // basicまたは不適切なタグの場合は更新
        if (currentStyleTag === 'basic' || 
            currentStyleTag === 'everyday' || 
            currentStyleTag === 'versatile' ||
            currentStyleTag === 'formal' ||
            currentStyleTag === 'elegant' ||
            currentStyleTag === 'outdoor' ||
            !['casual', 'street', 'mode', 'natural', 'classic', 'feminine'].includes(currentStyleTag)) {
          
          updates.push({
            id: product.id,
            style_tags: [newStyleTag]
          });
        }
      }
      
      // 3. バッチ更新
      if (updates.length > 0) {
        console.log(`  📝 ${updates.length}件の商品を更新中...`);
        
        // 小さなバッチに分けて更新
        const batchSize = 100;
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          
          for (const update of batch) {
            const { error: updateError } = await supabase
              .from('external_products')
              .update({ style_tags: update.style_tags })
              .eq('id', update.id);
            
            if (updateError) {
              console.error(`商品 ${update.id} の更新エラー:`, updateError);
            } else {
              totalUpdated++;
            }
          }
        }
      }
      
      totalProcessed += products.length;
      offset += pageSize;
      
      console.log(`✅ ${totalProcessed}件処理済み, ${totalUpdated}件更新済み`);
    }
    
    console.log('\n========================================');
    console.log(`🎉 スタイルタグの修正が完了しました！`);
    console.log(`   処理した商品数: ${totalProcessed}`);
    console.log(`   更新した商品数: ${totalUpdated}`);
    console.log('========================================\n');
    
    // 4. 更新後の統計を表示
    const { data: stats } = await supabase
      .rpc('get_style_tag_stats');
    
    if (stats) {
      console.log('📊 更新後のスタイルタグ分布:');
      stats.forEach((stat: any) => {
        console.log(`   ${stat.style_tag}: ${stat.count}件`);
      });
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// RPCファンクションの作成（存在しない場合）
async function createStatsFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_style_tag_stats()
    RETURNS TABLE(style_tag text, count bigint)
    AS $$
    BEGIN
      RETURN QUERY
      SELECT unnest(style_tags) as style_tag, COUNT(*) as count
      FROM external_products
      WHERE is_active = true
        AND style_tags IS NOT NULL
      GROUP BY style_tag
      ORDER BY count DESC;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    await supabase.rpc('exec_sql', { sql_query: sql });
  } catch (error) {
    // 関数が既に存在する場合はエラーを無視
  }
}

// メイン実行
async function main() {
  await createStatsFunction();
  await fixStyleTags();
  process.exit(0);
}

main().catch(console.error);
