const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addIsUsedColumn() {
  console.log('🔧 is_usedカラムの追加を開始します...\n');

  try {
    // SQLクエリを実行するにはSupabase ダッシュボードまたはsupabase CLIを使う必要があるため、
    // ここではローカルでカラムが追加されたことを確認する方法を提供します
    
    console.log('📝 以下のSQLをSupabaseダッシュボードで実行してください:\n');
    console.log(`-- 中古品フィルター機能のためのカラム追加
-- external_productsテーブルにis_usedカラムを追加

-- is_usedカラムの追加（中古品フラグ）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT false;

-- パフォーマンス向上のためのインデックス作成
CREATE INDEX IF NOT EXISTS idx_external_products_is_used 
ON external_products (is_used);

-- 既存データの更新（商品名とショップ名から中古品を判定）
UPDATE external_products
SET is_used = true
WHERE is_used = false
  AND (
    -- タイトルに中古関連キーワードが含まれる
    LOWER(title) LIKE '%中古%'
    OR LOWER(title) LIKE '%used%'
    OR LOWER(title) LIKE '%ユーズド%'
    OR LOWER(title) LIKE '%セカンドハンド%'
    OR LOWER(title) LIKE '%リユース%'
    -- ブランド/ショップ名に中古専門店が含まれる
    OR LOWER(brand) LIKE '%セカンドストリート%'
    OR LOWER(brand) LIKE '%メルカリ%'
    OR LOWER(brand) LIKE '%ラクマ%'
    OR LOWER(brand) LIKE '%2nd street%'
    OR LOWER(brand) LIKE '%リサイクル%'
  );`);
    
    console.log('\n\n📌 実行手順:');
    console.log('1. Supabaseダッシュボード (https://app.supabase.com) にログイン');
    console.log('2. プロジェクトを選択');
    console.log('3. SQL Editor に移動');
    console.log('4. 上記のSQLをコピー＆ペースト');
    console.log('5. "Run" ボタンをクリック');
    
    console.log('\n\n🔍 実行後、以下のコマンドで確認できます:');
    console.log('   node scripts/check-is-used-column.js');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

addIsUsedColumn();
