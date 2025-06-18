require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkClickLogsStructure() {
  console.log('Checking click_logs table structure...\n');
  
  try {
    // テーブルのカラム情報を取得
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', {
        table_name: 'click_logs'
      });
      
    if (error) {
      // 直接クエリを試す
      const { data, error: queryError } = await supabase
        .from('click_logs')
        .select('*')
        .limit(0);
        
      if (queryError) {
        console.error('Error:', queryError);
      } else {
        console.log('click_logs table exists');
      }
      
      // サンプルデータを確認
      const { data: sample, error: sampleError } = await supabase
        .from('click_logs')
        .select('*')
        .limit(5);
        
      console.log('\nSample data:');
      console.log(sample || 'No data found');
    } else {
      console.log('Table columns:', columns);
    }
    
  } catch (err) {
    console.error('Error checking table:', err);
  }
  
  process.exit(0);
}

checkClickLogsStructure();
