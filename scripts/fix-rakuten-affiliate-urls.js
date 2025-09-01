#!/usr/bin/env node
/**
 * 楽天商品のアフィリエイトURLを正しいアフィリエイトIDで更新するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../.env') });

// Supabase設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const rakutenAffiliateId = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

if (!rakutenAffiliateId) {
  console.error('❌ 楽天アフィリエイトIDが設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRakutenAffiliateUrls() {
  console.log('🔧 楽天アフィリエイトURLの修正を開始します...');
  console.log(`📝 使用するアフィリエイトID: ${rakutenAffiliateId}`);

  try {
    // 楽天商品を取得
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('id, affiliate_url')
      .eq('source', 'rakuten');

    if (fetchError) {
      console.error('❌ 商品取得エラー:', fetchError);
      return;
    }

    console.log(`📊 対象商品数: ${products.length}`);

    let updatedCount = 0;
    let errorCount = 0;

    // バッチ処理のサイズ
    const batchSize = 100;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const updates = [];

      for (const product of batch) {
        let updatedUrl = product.affiliate_url;

        // URLが楽天のアフィリエイトURLの場合、正しいアフィリエイトIDに更新
        if (updatedUrl && updatedUrl.includes('hb.afl.rakuten.co.jp')) {
          // 既存のrafcidパラメータを正しいものに置き換え
          if (updatedUrl.includes('rafcid=')) {
            // 既存のrafcidを新しいものに置き換え
            updatedUrl = updatedUrl.replace(
              /rafcid=[^&]*/,
              `rafcid=${rakutenAffiliateId}`
            );
          } else {
            // rafcidパラメータを追加
            const separator = updatedUrl.includes('?') ? '&' : '?';
            updatedUrl = `${updatedUrl}${separator}rafcid=${rakutenAffiliateId}`;
          }
        } else if (!updatedUrl || updatedUrl === '' || updatedUrl === 'https://hb.afl.rakuten.co.jp/') {
          // 不完全なURLの場合はスキップ（後で別途処理）
          console.log(`⚠️ 不完全なURL: ${product.id}`);
          continue;
        }

        updates.push({
          id: product.id,
          affiliate_url: updatedUrl
        });
      }

      if (updates.length > 0) {
        // バッチ更新
        const { error: updateError } = await supabase
          .from('external_products')
          .upsert(updates, { onConflict: 'id' });

        if (updateError) {
          console.error(`❌ バッチ ${Math.floor(i / batchSize) + 1} 更新エラー:`, updateError);
          errorCount += updates.length;
        } else {
          updatedCount += updates.length;
          console.log(`✅ バッチ ${Math.floor(i / batchSize) + 1} 完了: ${updates.length} 件更新`);
        }
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📈 処理結果:');
    console.log(`✅ 更新成功: ${updatedCount} 件`);
    console.log(`❌ エラー: ${errorCount} 件`);

    // 検証: 更新後のサンプルを確認
    const { data: sample } = await supabase
      .from('external_products')
      .select('id, affiliate_url')
      .eq('source', 'rakuten')
      .limit(3);

    console.log('\n🔍 更新後のサンプル:');
    sample?.forEach(item => {
      console.log(`- ${item.id}`);
      console.log(`  URL: ${item.affiliate_url?.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// スクリプト実行
fixRakutenAffiliateUrls()
  .then(() => {
    console.log('\n✨ 楽天アフィリエイトURL修正完了');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ スクリプトエラー:', error);
    process.exit(1);
  });
