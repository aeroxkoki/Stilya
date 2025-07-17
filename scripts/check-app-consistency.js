const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * アプリケーション全体の整合性をチェックするスクリプト
 */
async function checkAppConsistency() {
  console.log('=== Stilyaアプリ整合性チェック開始 ===\n');
  
  const issues = [];
  
  // 1. データベースフィールドとTypeScript型の整合性チェック
  console.log('1. データベースフィールドチェック...');
  try {
    // external_productsテーブルの構造を取得
    const { data: tableInfo, error } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);
    
    if (!error && tableInfo && tableInfo.length > 0) {
      const dbFields = Object.keys(tableInfo[0]);
      console.log('データベースのフィールド:', dbFields);
      
      // TypeScriptのProduct型で期待されるフィールド
      const expectedFields = {
        // DB形式 -> TS形式のマッピング
        'image_url': 'imageUrl',
        'affiliate_url': 'affiliateUrl',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt',
        'is_used': 'isUsed',
        'is_active': 'isActive',
        'shop_name': 'shopName',
        'review_count': 'reviewCount',
        'popularity_score': 'popularityScore',
        'last_synced': 'lastSynced'
      };
      
      // 不整合を検出
      Object.entries(expectedFields).forEach(([dbField, tsField]) => {
        if (dbFields.includes(dbField)) {
          issues.push({
            type: 'フィールド名の不整合',
            description: `DB: ${dbField} vs TS: ${tsField}`,
            severity: 'medium'
          });
        }
      });
    }
  } catch (error) {
    console.error('データベースチェックエラー:', error);
  }
  
  // 2. swipesテーブルの整合性チェック
  console.log('\n2. swipesテーブルチェック...');
  try {
    const { data: swipes, error } = await supabase
      .from('swipes')
      .select('*')
      .limit(5);
    
    if (!error && swipes) {
      console.log('swipesテーブルのレコード数:', swipes.length);
      
      // product_idが実在するかチェック
      if (swipes.length > 0) {
        const productIds = swipes.map(s => s.product_id);
        const { data: products, error: productError } = await supabase
          .from('external_products')
          .select('id')
          .in('id', productIds);
        
        if (!productError) {
          const existingIds = products.map(p => p.id);
          const missingIds = productIds.filter(id => !existingIds.includes(id));
          
          if (missingIds.length > 0) {
            issues.push({
              type: '参照整合性エラー',
              description: `swipesテーブルに存在しない商品IDへの参照: ${missingIds.join(', ')}`,
              severity: 'high'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('swipesテーブルチェックエラー:', error);
  }
  
  // 3. favoritesテーブルの整合性チェック
  console.log('\n3. favoritesテーブルチェック...');
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .limit(5);
    
    if (!error && favorites) {
      console.log('favoritesテーブルのレコード数:', favorites.length);
      
      // product_idが実在するかチェック
      if (favorites.length > 0) {
        const productIds = favorites.map(f => f.product_id);
        const { data: products, error: productError } = await supabase
          .from('external_products')
          .select('id')
          .in('id', productIds);
        
        if (!productError) {
          const existingIds = products.map(p => p.id);
          const missingIds = productIds.filter(id => !existingIds.includes(id));
          
          if (missingIds.length > 0) {
            issues.push({
              type: '参照整合性エラー',
              description: `favoritesテーブルに存在しない商品IDへの参照: ${missingIds.join(', ')}`,
              severity: 'high'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('favoritesテーブルチェックエラー:', error);
  }
  
  // 4. 価格フィールドの整合性チェック
  console.log('\n4. 価格データチェック...');
  try {
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, price')
      .or('price.is.null,price.eq.0')
      .limit(10);
    
    if (!error && products && products.length > 0) {
      issues.push({
        type: '不正なデータ',
        description: `価格が0または未設定の商品が${products.length}件見つかりました`,
        severity: 'medium'
      });
    }
  } catch (error) {
    console.error('価格データチェックエラー:', error);
  }
  
  // 5. タグデータの整合性チェック
  console.log('\n5. タグデータチェック...');
  try {
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, tags')
      .limit(100);
    
    if (!error && products) {
      const emptyTagsCount = products.filter(p => !p.tags || p.tags.length === 0).length;
      if (emptyTagsCount > 0) {
        issues.push({
          type: '不完全なデータ',
          description: `タグが設定されていない商品が${emptyTagsCount}件見つかりました`,
          severity: 'low'
        });
      }
      
      // スタイルタグの一貫性チェック
      const styleTagMap = {
        'カジュアル': 'casual',
        'きれいめ': 'clean',
        'モード': 'mode',
        'ストリート': 'street',
        'ナチュラル': 'natural',
        'フェミニン': 'feminine'
      };
      
      let inconsistentStyleTags = 0;
      products.forEach(product => {
        if (product.tags) {
          product.tags.forEach(tag => {
            if (Object.values(styleTagMap).includes(tag)) {
              inconsistentStyleTags++;
            }
          });
        }
      });
      
      if (inconsistentStyleTags > 0) {
        issues.push({
          type: 'タグの不整合',
          description: `英語のスタイルタグが${inconsistentStyleTags}件見つかりました（日本語に統一すべき）`,
          severity: 'medium'
        });
      }
    }
  } catch (error) {
    console.error('タグデータチェックエラー:', error);
  }
  
  // 6. 重複商品のチェック
  console.log('\n6. 重複商品チェック...');
  try {
    const { data: duplicates, error } = await supabase.rpc('check_duplicate_products');
    
    if (!error && duplicates && duplicates.length > 0) {
      issues.push({
        type: '重複データ',
        description: `重複している可能性のある商品が${duplicates.length}件見つかりました`,
        severity: 'medium'
      });
    }
  } catch (error) {
    // RPCが存在しない場合は手動でチェック
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('title, count:id')
      .limit(1000);
    
    if (!productError && products) {
      const titleCounts = {};
      products.forEach(p => {
        if (p.title) {
          titleCounts[p.title] = (titleCounts[p.title] || 0) + 1;
        }
      });
      
      const duplicateTitles = Object.entries(titleCounts)
        .filter(([_, count]) => count > 1)
        .map(([title, count]) => ({ title, count }));
      
      if (duplicateTitles.length > 0) {
        issues.push({
          type: '重複データ',
          description: `同じタイトルの商品が複数存在: ${duplicateTitles.length}件`,
          severity: 'medium'
        });
      }
    }
  }
  
  // 結果の表示
  console.log('\n=== 整合性チェック結果 ===\n');
  
  if (issues.length === 0) {
    console.log('✅ 整合性の問題は見つかりませんでした。');
  } else {
    console.log(`⚠️  ${issues.length}件の問題が見つかりました:\n`);
    
    // 重要度別に分類
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    const lowIssues = issues.filter(i => i.severity === 'low');
    
    if (highIssues.length > 0) {
      console.log('🔴 重要度: 高');
      highIssues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.description}`);
      });
      console.log('');
    }
    
    if (mediumIssues.length > 0) {
      console.log('🟠 重要度: 中');
      mediumIssues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.description}`);
      });
      console.log('');
    }
    
    if (lowIssues.length > 0) {
      console.log('🟡 重要度: 低');
      lowIssues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.description}`);
      });
    }
  }
  
  // 推奨事項
  console.log('\n=== 推奨事項 ===\n');
  console.log('1. フィールド名の統一:');
  console.log('   - データベースのsnake_caseとTypeScriptのcamelCaseの変換を一元化');
  console.log('   - normalizeProduct関数ですべてのフィールドマッピングを処理\n');
  
  console.log('2. 参照整合性の確保:');
  console.log('   - 外部キー制約の追加を検討');
  console.log('   - 商品削除時の関連データの処理\n');
  
  console.log('3. データ品質の向上:');
  console.log('   - 必須フィールドのバリデーション強化');
  console.log('   - タグの正規化と一貫性の確保');
}

// スクリプトを実行
checkAppConsistency();
