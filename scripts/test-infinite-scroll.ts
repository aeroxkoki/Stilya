/**
 * 無限スクロール機能のテストスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 無限スクロール機能の確認
async function testInfiniteScroll() {
  console.log('📋 無限スクロール機能のテスト開始\n');

  try {
    // 1. 商品の総数確認（external_products テーブルを使用）
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    console.log(`✅ 商品総数: ${totalCount}件\n`);

    // 2. ページネーションテスト（20件ずつ取得）
    const PAGE_SIZE = 20;
    const pages = Math.ceil((totalCount || 0) / PAGE_SIZE);
    
    console.log(`📄 ページ数: ${pages}ページ (1ページあたり${PAGE_SIZE}件)`);
    console.log('-----------------------------------');

    for (let page = 1; page <= Math.min(3, pages); page++) {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, price')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '')
        .range(from, to)
        .order('priority', { ascending: true })
        .order('last_synced', { ascending: false });

      if (error) {
        console.error(`❌ ページ${page}の取得エラー:`, error);
        continue;
      }

      console.log(`\n📑 ページ ${page}:`);
      console.log(`  取得件数: ${data?.length}件`);
      console.log(`  範囲: ${from + 1}〜${Math.min(to + 1, totalCount || 0)}件目`);
      
      if (data && data.length > 0) {
        console.log(`  最初の商品: ${data[0].title} (¥${data[0].price})`);
        console.log(`  最後の商品: ${data[data.length - 1].title} (¥${data[data.length - 1].price})`);
      }
    }

    console.log('\n-----------------------------------');
    console.log('✅ 無限スクロール機能テスト完了');
    console.log('\n📱 実機での確認項目:');
    console.log('1. おすすめ画面を開く');
    console.log('2. 下にスクロールして商品リストの最下部に到達');
    console.log('3. 「読み込み中...」表示が出て、追加商品が読み込まれることを確認');
    console.log('4. さらにスクロールして追加読み込みが繰り返されることを確認');
    console.log('5. 全商品を読み込み終わると追加読み込みが停止することを確認');

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

// テスト実行
testInfiniteScroll();
