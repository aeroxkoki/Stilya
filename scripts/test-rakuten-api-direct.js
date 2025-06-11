// 楽天API接続テストスクリプト

const fetch = require('node-fetch');
require('dotenv').config();

// 環境変数の確認
console.log('=== Environment Variables Check ===');
console.log('EXPO_PUBLIC_RAKUTEN_APP_ID:', process.env.EXPO_PUBLIC_RAKUTEN_APP_ID ? 'Set' : 'Not set');
console.log('EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID:', process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID ? 'Set' : 'Not set');
console.log('');

const RAKUTEN_APP_ID = process.env.EXPO_PUBLIC_RAKUTEN_APP_ID || process.env.RAKUTEN_APP_ID;
const RAKUTEN_AFFILIATE_ID = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID || process.env.RAKUTEN_AFFILIATE_ID;

if (!RAKUTEN_APP_ID || !RAKUTEN_AFFILIATE_ID) {
  console.error('❌ Rakuten API keys are not set!');
  console.log('Please check your .env file and make sure these variables are set:');
  console.log('- EXPO_PUBLIC_RAKUTEN_APP_ID');
  console.log('- EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID');
  process.exit(1);
}

console.log('✅ API keys are set');
console.log('');

// 楽天APIテスト
async function testRakutenAPI() {
  console.log('=== Testing Rakuten API ===');
  
  const params = new URLSearchParams({
    format: 'json',
    keyword: 'ファッション',
    genreId: '100371', // レディースファッション
    page: '1',
    hits: '5',
    applicationId: RAKUTEN_APP_ID,
    affiliateId: RAKUTEN_AFFILIATE_ID,
    sort: '+updateTimestamp',
    imageFlag: '1',
  });
  
  const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params}`;
  console.log('API URL:', url.replace(RAKUTEN_APP_ID, 'APP_ID_HIDDEN'));
  
  try {
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    
    if (data.Items && data.Items.length > 0) {
      console.log('✅ API call successful!');
      console.log(`Found ${data.Items.length} products`);
      console.log('');
      console.log('First product:');
      const firstItem = data.Items[0].Item || data.Items[0];
      console.log('- Name:', firstItem.itemName);
      console.log('- Price:', firstItem.itemPrice, '円');
      console.log('- Shop:', firstItem.shopName);
      console.log('- Has image:', !!firstItem.mediumImageUrls);
    } else {
      console.log('⚠️ No products returned from API');
    }
  } catch (error) {
    console.error('❌ Error calling Rakuten API:', error.message);
  }
}

// テスト実行
testRakutenAPI();
