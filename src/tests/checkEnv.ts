// 環境変数の確認スクリプト
import { RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID, SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

console.log('=== 環境変数チェック ===');
console.log('RAKUTEN_APP_ID:', RAKUTEN_APP_ID);
console.log('RAKUTEN_AFFILIATE_ID:', RAKUTEN_AFFILIATE_ID);
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Not Set');

// 必須環境変数のチェック
const requiredVars = [
  { name: 'RAKUTEN_APP_ID', value: RAKUTEN_APP_ID },
  { name: 'RAKUTEN_AFFILIATE_ID', value: RAKUTEN_AFFILIATE_ID },
  { name: 'SUPABASE_URL', value: SUPABASE_URL },
  { name: 'SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY }
];

const missingVars = requiredVars.filter(({ value }) => !value);

if (missingVars.length > 0) {
  console.error('❌ 以下の環境変数が設定されていません:', missingVars.map(v => v.name).join(', '));
} else {
  console.log('✅ すべての必須環境変数が設定されています');
}

export {};
