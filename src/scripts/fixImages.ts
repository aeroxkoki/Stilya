// 画像URLの修正を実行するスクリプト
// 実行方法: npx ts-node src/scripts/fixImages.ts

import 'react-native';
import { refreshAllProductData } from '../utils/fixImageUrls';

// React Nativeの環境変数設定
(global as any).__DEV__ = true;

const runFix = async () => {
  console.log('🔧 Starting image URL fix script...\n');
  
  try {
    // 完全な商品データのリフレッシュを実行
    await refreshAllProductData();
    
    console.log('\n✅ Fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during fix:', error);
    process.exit(1);
  }
};

// スクリプトを実行
runFix();
