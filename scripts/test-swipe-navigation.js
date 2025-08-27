#!/usr/bin/env node
/**
 * スワイプ画面から商品詳細画面への遷移をテストするスクリプト
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase接続設定
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xvjsbbjfgwvqkrwpnatw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2anNiYmpmZ3d2cWtyd3BuYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExMjU4ODcsImV4cCI6MjA0NjcwMTg4N30.M7MXHqFMnAr-JkPCVL99p84KeUyqasqQI8NST79VHIY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductNavigation() {
  console.log('🧪 スワイプナビゲーションテスト開始...\n');
  
  try {
    // 1. 商品データの存在確認
    console.log('1️⃣ 商品データの確認中...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, title, brand, price')
      .limit(5);
      
    if (productError) {
      throw new Error(`商品データの取得に失敗: ${productError.message}`);
    }
    
    if (!products || products.length === 0) {
      console.error('❌ 商品データが存在しません');
      return;
    }
    
    console.log(`✅ ${products.length}件の商品が見つかりました`);
    
    // 2. 各商品のIDの検証
    console.log('\n2️⃣ 商品IDの検証中...');
    let validCount = 0;
    let invalidCount = 0;
    
    products.forEach((product) => {
      if (product.id && typeof product.id === 'string' && product.id.length > 0) {
        console.log(`✅ 有効な商品ID: ${product.id} - ${product.title}`);
        validCount++;
      } else {
        console.error(`❌ 無効な商品ID: ${JSON.stringify(product)}`);
        invalidCount++;
      }
    });
    
    console.log(`\n📊 検証結果: 有効 ${validCount}件 / 無効 ${invalidCount}件`);
    
    // 3. ランダムな商品で詳細取得テスト
    if (validCount > 0) {
      console.log('\n3️⃣ 商品詳細取得のテスト中...');
      const randomProduct = products.find(p => p.id);
      
      const { data: detailProduct, error: detailError } = await supabase
        .from('products')
        .select('*')
        .eq('id', randomProduct.id)
        .single();
        
      if (detailError) {
        console.error(`❌ 商品詳細の取得に失敗: ${detailError.message}`);
      } else if (detailProduct) {
        console.log(`✅ 商品詳細を正常に取得: ${detailProduct.title}`);
        console.log(`   ID: ${detailProduct.id}`);
        console.log(`   ブランド: ${detailProduct.brand || 'なし'}`);
        console.log(`   価格: ¥${detailProduct.price.toLocaleString()}`);
        console.log(`   画像URL: ${detailProduct.imageUrl ? '設定済み' : '未設定'}`);
      }
    }
    
    // 4. ナビゲーションパラメータのテスト
    console.log('\n4️⃣ ナビゲーションパラメータのシミュレーション...');
    if (products.length > 0) {
      const testProduct = products[0];
      const navigationParams = {
        productId: testProduct.id,
        from: 'swipe'
      };
      console.log(`✅ ナビゲーションパラメータ:`, JSON.stringify(navigationParams, null, 2));
    }
    
    // 5. 推奨事項
    console.log('\n📝 推奨事項:');
    if (invalidCount > 0) {
      console.log('⚠️  無効なIDを持つ商品が存在します。データベースの整合性を確認してください。');
    }
    console.log('💡 スワイプ画面でタップ時にconsole.logを確認してください。');
    console.log('💡 ProductDetailScreenのログでproductIdが正しく受信されているか確認してください。');
    console.log('💡 ナビゲーションエラーが発生する場合は、ナビゲーション構造を確認してください。');
    console.log('💡 画像が表示されない場合は、imageUrlフィールドを確認してください。');
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    console.log('\n✅ テスト完了');
    process.exit(0);
  }
}

// テスト実行
testProductNavigation();
