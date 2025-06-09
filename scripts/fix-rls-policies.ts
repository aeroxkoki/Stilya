import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 RLSポリシーの修正を開始します...');

  try {
    // external_productsテーブルのRLSを無効化
    const { error: disableRLSError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;
      `
    });

    if (disableRLSError) {
      console.error('❌ RLS無効化エラー:', disableRLSError);
      // RLSが既に無効の場合もあるので処理を続行
    } else {
      console.log('✅ external_productsのRLSを無効化しました');
    }

    // 既存のポリシーを削除
    const { error: dropPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view all products" ON external_products;
        DROP POLICY IF EXISTS "Service role can insert products" ON external_products;
        DROP POLICY IF EXISTS "Service role can update products" ON external_products;
        DROP POLICY IF EXISTS "Service role can delete products" ON external_products;
      `
    });

    if (dropPoliciesError) {
      console.error('⚠️ ポリシー削除時の警告:', dropPoliciesError);
    }

    // productsテーブルの存在確認とRLS設定
    const { error: checkProductsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
            ALTER TABLE products DISABLE ROW LEVEL SECURITY;
          END IF;
        END $$;
      `
    });

    if (checkProductsError) {
      console.error('⚠️ productsテーブルのRLS設定エラー:', checkProductsError);
    }

    console.log('✅ RLSポリシーの修正が完了しました');
    
    // テーブルの権限を確認
    const { data: permissions, error: permError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          has_table_privilege(tablename, 'SELECT') as can_select,
          has_table_privilege(tablename, 'INSERT') as can_insert,
          has_table_privilege(tablename, 'UPDATE') as can_update,
          has_table_privilege(tablename, 'DELETE') as can_delete
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('external_products', 'products');
      `
    });

    if (permissions) {
      console.log('📊 テーブル権限状況:', permissions);
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
fixRLSPolicies();
