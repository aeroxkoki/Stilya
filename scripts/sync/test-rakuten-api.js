// 楽天API認証情報テストスクリプト
const axios = require('axios');
require('dotenv').config();

// 楽天API認証情報
const RAKUTEN_APP_ID = '1070253780037975195';
const RAKUTEN_AFFILIATE_ID = '3ad7bc23.8866b306.3ad7bc24.393c3977';

async function testRakutenAPI() {
  console.log('🧪 楽天APIテストを開始します...\n');
  
  // 認証情報の確認
  console.log('📋 認証情報:');
  console.log(`- Application ID: ${RAKUTEN_APP_ID}`);
  console.log(`- Affiliate ID: ${RAKUTEN_AFFILIATE_ID}\n`);
  
  try {
    // テストリクエスト（女性ファッションカテゴリ）
    const params = {
      applicationId: RAKUTEN_APP_ID,
      affiliateId: RAKUTEN_AFFILIATE_ID,
      genreId: '100371', // 女性ファッション
      hits: 5, // 取得数を5件に制限
      page: 1,
      format: 'json'
    };
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${queryString}`;
    
    console.log('📡 APIリクエストを送信中...');
    console.log(`URL: ${url}\n`);
    
    const response = await axios.get(url);
    
    if (response.data && response.data.Items) {
      console.log('✅ APIリクエスト成功！\n');
      console.log(`📊 取得結果:`);
      console.log(`- 総件数: ${response.data.count}件`);
      console.log(`- 取得件数: ${response.data.Items.length}件\n`);
      
      console.log('🛍️ 取得した商品サンプル:');
      response.data.Items.slice(0, 3).forEach((item, index) => {
        const product = item.Item;
        console.log(`\n${index + 1}. ${product.itemName}`);
        console.log(`   価格: ¥${product.itemPrice.toLocaleString()}`);
        console.log(`   ブランド: ${product.shopName}`);
        console.log(`   商品ID: ${product.itemCode}`);
        if (product.affiliateUrl) {
          console.log(`   アフィリエイトURL: ${product.affiliateUrl.substring(0, 50)}...`);
        }
      });
      
      console.log('\n✨ 楽天API認証情報は正常に動作しています！');
      return true;
    } else {
      console.error('❌ APIレスポンスが不正です');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    
    if (error.response) {
      console.error(`- ステータス: ${error.response.status}`);
      console.error(`- メッセージ: ${error.response.statusText}`);
      if (error.response.data) {
        console.error('- 詳細:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.response.status === 400) {
        console.error('\n⚠️ パラメータエラー: APIキーまたはアフィリエイトIDが無効です');
      } else if (error.response.status === 404) {
        console.error('\n⚠️ エンドポイントエラー: APIのURLが正しくありません');
      } else if (error.response.status === 429) {
        console.error('\n⚠️ レート制限: APIの呼び出し回数が制限を超えています');
      }
    } else if (error.request) {
      console.error('- ネットワークエラー: APIサーバーに接続できません');
      console.error('- 詳細:', error.message);
    } else {
      console.error('- その他のエラー:', error.message);
    }
    
    return false;
  }
}

// テストを実行
console.log('='.repeat(60));
console.log('🚀 Stilya - 楽天API認証情報テスト');
console.log('='.repeat(60) + '\n');

testRakutenAPI().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 テスト完了: すべて正常です！');
  } else {
    console.log('⚠️ テスト失敗: 設定を確認してください');
  }
  console.log('='.repeat(60));
});
