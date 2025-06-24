const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSwipeData() {
  try {
    console.log('Analyzing swipe data...\n');
    
    // ユーザーごとのスワイプ数を確認
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('user_id, product_id');
      
    if (swipeError) {
      console.error('Error fetching swipes:', swipeError);
      return;
    }
    
    // ユーザーごとのスワイプ数を集計
    const userSwipeCounts = {};
    const swipedProducts = new Set();
    
    swipes.forEach(swipe => {
      userSwipeCounts[swipe.user_id] = (userSwipeCounts[swipe.user_id] || 0) + 1;
      swipedProducts.add(swipe.product_id);
    });
    
    console.log(`Total swipes: ${swipes.length}`);
    console.log(`Unique swiped products: ${swipedProducts.size}`);
    console.log(`Total users who swiped: ${Object.keys(userSwipeCounts).length}`);
    
    console.log('\nTop 5 users by swipe count:');
    const sortedUsers = Object.entries(userSwipeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
      
    sortedUsers.forEach(([userId, count], index) => {
      console.log(`${index + 1}. User ${userId.slice(0, 8)}...: ${count} swipes`);
    });
    
    // source別の商品数と未スワイプ商品数を確認
    const { data: allProducts, error: productError } = await supabase
      .from('external_products')
      .select('id, source')
      .eq('is_active', true);
      
    if (productError) {
      console.error('Error fetching products:', productError);
      return;
    }
    
    const sourceCounts = {};
    const unswipedBySource = {};
    
    allProducts.forEach(product => {
      const source = product.source || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      
      if (!swipedProducts.has(product.id)) {
        unswipedBySource[source] = (unswipedBySource[source] || 0) + 1;
      }
    });
    
    console.log('\nProduct availability by source:');
    Object.entries(sourceCounts).forEach(([source, total]) => {
      const unswiped = unswipedBySource[source] || 0;
      const percentage = ((unswiped / total) * 100).toFixed(1);
      console.log(`  ${source}: ${unswiped}/${total} unswiped (${percentage}%)`);
    });
    
    // 最近のユーザーのスワイプ状況を確認
    const { data: recentUser } = await supabase
      .from('users')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (recentUser) {
      const { count: userSwipeCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', recentUser.id);
        
      console.log(`\nMost recent user (${recentUser.id.slice(0, 8)}...):`);
      console.log(`  Created: ${new Date(recentUser.created_at).toLocaleDateString()}`);
      console.log(`  Swipes: ${userSwipeCount || 0}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeSwipeData();
