// 楽天APIのテストスクリプト
import { fetchRakutenFashionProducts } from '../services/rakutenService';

const testRakutenAPI = async () => {
  console.log('=== 楽天APIテスト開始 ===');
  
  try {
    // 少ない数でテスト
    const result = await fetchRakutenFashionProducts(
      'レディース',
      100371,
      1,
      5,
      true // キャッシュを無視
    );
    
    console.log('✅ 楽天API呼び出し成功');
    console.log('取得商品数:', result.products.length);
    console.log('総商品数:', result.totalProducts);
    
    if (result.products.length > 0) {
      console.log('\n最初の商品:');
      const firstProduct = result.products[0];
      console.log('- ID:', firstProduct.id);
      console.log('- タイトル:', firstProduct.title);
      console.log('- 価格:', firstProduct.price);
      console.log('- ブランド:', firstProduct.brand);
      console.log('- タグ:', firstProduct.tags.join(', '));
    }
  } catch (error: any) {
    console.error('❌ 楽天API呼び出しエラー:', error.message);
    if (error.response) {
      console.error('レスポンスステータス:', error.response.status);
      console.error('レスポンスデータ:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('\n=== 楽天APIテスト終了 ===');
};

// テスト実行
testRakutenAPI();

export {};
