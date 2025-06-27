import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

/**
 * キャッシュとデータベースをクリアして新しい商品データを取得する
 */
async function clearCacheAndRefresh() {
  console.log('=== キャッシュクリアと商品データ更新 ===');
  
  try {
    // 1. AsyncStorageから楽天のキャッシュをクリア
    console.log('\n1. キャッシュをクリアしています...');
    const keys = await AsyncStorage.getAllKeys();
    const rakutenCacheKeys = keys.filter(key => key.startsWith('rakuten_products_cache_'));
    
    if (rakutenCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(rakutenCacheKeys);
      console.log(`  ✅ ${rakutenCacheKeys.length}件のキャッシュをクリアしました`);
    } else {
      console.log('  ℹ️  キャッシュは既に空です');
    }
    
    // 2. Supabaseの既存の楽天商品を削除（オプション）
    console.log('\n2. 既存の楽天商品データを確認しています...');
    const { count } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'rakuten');
    
    console.log(`  現在の楽天商品数: ${count || 0}件`);
    
    // 既存データを削除するかユーザーに確認
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('\n既存の楽天商品データを削除しますか？ (y/n): ', resolve);
    });
    
    if (answer.toLowerCase() === 'y') {
      console.log('\n  削除中...');
      const { error } = await supabase
        .from('external_products')
        .delete()
        .eq('source', 'rakuten');
      
      if (error) {
        console.error('  ❌ 削除エラー:', error);
      } else {
        console.log('  ✅ 楽天商品データを削除しました');
      }
    }
    
    readline.close();
    
    console.log('\n=== 完了 ===');
    console.log('キャッシュがクリアされました。');
    console.log('次回アプリを起動すると、新しい画像URL最適化ロジックで商品が取得されます。');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
  
  process.exit(0);
}

// 実行
clearCacheAndRefresh();
