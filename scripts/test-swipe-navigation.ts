#!/usr/bin/env npx ts-node
/**
 * スワイプ画面から商品詳細画面への遷移をテストするスクリプト
 */

import { supabase } from '../src/services/supabase';

interface TestProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
}

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
    
    products.forEach((product: TestProduct) => {
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
      const randomProduct = products.find(p => p.id) as TestProduct;
      
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
      }
    }
    
    // 4. 推奨事項
    console.log('\n📝 推奨事項:');
    if (invalidCount > 0) {
      console.log('⚠️  無効なIDを持つ商品が存在します。データベースの整合性を確認してください。');
    }
    console.log('💡 スワイプ画面でタップ時にconsole.logを確認してください。');
    console.log('💡 ProductDetailScreenのログでproductIdが正しく受信されているか確認してください。');
    console.log('💡 ナビゲーションエラーが発生する場合は、ナビゲーション構造を確認してください。');
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error);
  } finally {
    console.log('\n✅ テスト完了');
    process.exit(0);
  }
}

// テスト実行
testProductNavigation();
