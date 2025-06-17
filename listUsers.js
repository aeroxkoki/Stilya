const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 環境変数の確認
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。.envファイルを確認してください。');
  console.error('必要な環境変数: SUPABASE_URL, SUPABASE_SERVICE_KEY または SUPABASE_ANON_KEY');
  process.exit(1);
}

// Supabaseクライアントの作成
const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
  try {
    console.log('ユーザー一覧を取得しています...');
    
    // ユーザーテーブルから情報を取得
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
    
    if (!users || users.length === 0) {
      console.log('ユーザーが見つかりませんでした。');
      return;
    }
    
    console.log('=== 既存ユーザー一覧 ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nickname: ${user.nickname || 'なし'}`);
      console.log(`   作成日: ${user.created_at}`);
      console.log('----------------------------');
    });
    console.log(`合計 ${users.length} 件のユーザーが見つかりました。`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
listUsers()
  .then(() => {
    console.log('スクリプトが正常に終了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプトの実行中にエラーが発生しました:', error);
    process.exit(1);
  });
