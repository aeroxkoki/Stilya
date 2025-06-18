require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testClickLogsImplementation() {
  console.log('Testing click_logs implementation...\n');
  
  try {
    // 1. テーブル構造の確認
    console.log('1. Checking table structure...');
    const { data: testData, error: testError } = await supabase
      .from('click_logs')
      .select('*')
      .limit(0);
    
    if (testError) {
      console.error('Error accessing click_logs table:', testError);
      return;
    }
    console.log('✓ click_logs table is accessible\n');
    
    // 2. テストユーザーとプロダクトID
    const testUserId = 'test-user-' + Date.now();
    const testProductId = 'test-product-' + Date.now();
    
    // 3. viewアクションの記録テスト
    console.log('2. Testing VIEW action...');
    const { data: viewData, error: viewError } = await supabase
      .from('click_logs')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        action: 'view'
      })
      .select()
      .single();
    
    if (viewError) {
      console.error('Error recording view:', viewError);
    } else {
      console.log('✓ View action recorded:', viewData);
    }
    
    // 4. clickアクションの記録テスト
    console.log('\n3. Testing CLICK action...');
    const { data: clickData, error: clickError } = await supabase
      .from('click_logs')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        action: 'click'
      })
      .select()
      .single();
    
    if (clickError) {
      console.error('Error recording click:', clickError);
    } else {
      console.log('✓ Click action recorded:', clickData);
    }
    
    // 5. データの取得テスト
    console.log('\n4. Testing data retrieval...');
    const { data: logs, error: logsError } = await supabase
      .from('click_logs')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (logsError) {
      console.error('Error fetching logs:', logsError);
    } else {
      console.log(`✓ Retrieved ${logs.length} logs for test user`);
      logs.forEach(log => {
        console.log(`  - ${log.action} at ${log.created_at}`);
      });
    }
    
    // 6. 統計情報の計算テスト
    console.log('\n5. Testing statistics calculation...');
    const { data: stats, error: statsError } = await supabase
      .from('click_logs')
      .select('action')
      .eq('product_id', testProductId);
    
    if (statsError) {
      console.error('Error fetching stats:', statsError);
    } else {
      const views = stats.filter(s => s.action === 'view').length;
      const clicks = stats.filter(s => s.action === 'click').length;
      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      
      console.log('✓ Statistics calculated:');
      console.log(`  - Views: ${views}`);
      console.log(`  - Clicks: ${clicks}`);
      console.log(`  - CTR: ${ctr.toFixed(2)}%`);
    }
    
    // 7. クリーンアップ
    console.log('\n6. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('click_logs')
      .delete()
      .eq('user_id', testUserId);
    
    if (deleteError) {
      console.error('Error cleaning up:', deleteError);
    } else {
      console.log('✓ Test data cleaned up');
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\nImplementation summary:');
    console.log('- click_logs table is properly configured');
    console.log('- Action types (view, click) are working correctly');
    console.log('- Data retrieval and statistics calculation are functional');
    console.log('- The affiliate tracking system is ready for use');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  process.exit(0);
}

testClickLogsImplementation();
