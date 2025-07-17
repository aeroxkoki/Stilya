const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * コード内の整合性をチェックするスクリプト
 */
async function checkCodeConsistency() {
  console.log('=== Stilyaアプリ コードベース整合性チェック ===\n');
  
  const issues = [];
  
  // 1. TypeScriptファイルのチェック
  console.log('1. TypeScriptファイルの整合性チェック...\n');
  
  // Product型の定義をチェック
  const productTypePath = path.join(__dirname, '../src/types/product.ts');
  if (fs.existsSync(productTypePath)) {
    const productTypeContent = fs.readFileSync(productTypePath, 'utf-8');
    
    // 重複フィールドの検出
    const duplicateFields = [
      ['imageUrl', 'image_url'],
      ['affiliateUrl', 'affiliate_url'],
      ['createdAt', 'created_at'],
      ['isUsed', 'is_used'],
      ['reviewCount', 'review_count']
    ];
    
    duplicateFields.forEach(([camelCase, snakeCase]) => {
      if (productTypeContent.includes(camelCase) && productTypeContent.includes(snakeCase)) {
        issues.push({
          type: 'TypeScript型定義の重複',
          file: 'src/types/product.ts',
          description: `${camelCase}と${snakeCase}の両方が定義されています`,
          severity: 'medium'
        });
      }
    });
  }
  
  // 2. コンポーネントファイルでの商品データアクセスパターンのチェック
  console.log('2. コンポーネントでの商品データアクセスパターンチェック...\n');
  
  const componentsToCheck = [
    'src/screens/swipe/SwipeScreen.tsx',
    'src/screens/detail/ProductDetailScreen.tsx',
    'src/screens/profile/FavoritesScreen.tsx',
    'src/screens/profile/SwipeHistoryScreen.tsx',
    'src/components/common/ProductCard.tsx',
    'src/components/swipe/SwipeCard.tsx'
  ];
  
  componentsToCheck.forEach(componentPath => {
    const fullPath = path.join(__dirname, '..', componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // image_urlの直接アクセスをチェック
      if (content.includes('.image_url') && !content.includes('.imageUrl')) {
        issues.push({
          type: 'フィールドアクセスの不整合',
          file: componentPath,
          description: 'image_urlを直接参照しています（imageUrlを使用すべき）',
          severity: 'high'
        });
      }
      
      // affiliate_urlの直接アクセスをチェック
      if (content.includes('.affiliate_url') && !content.includes('.affiliateUrl')) {
        issues.push({
          type: 'フィールドアクセスの不整合',
          file: componentPath,
          description: 'affiliate_urlを直接参照しています（affiliateUrlを使用すべき）',
          severity: 'high'
        });
      }
    }
  });
  
  // 3. サービスファイルのチェック
  console.log('3. サービスファイルの整合性チェック...\n');
  
  const servicesToCheck = [
    'src/services/productService.ts',
    'src/services/swipeService.ts',
    'src/services/favoriteService.ts',
    'src/services/recommendationService.ts'
  ];
  
  servicesToCheck.forEach(servicePath => {
    const fullPath = path.join(__dirname, '..', servicePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // normalizeProduct関数の有無をチェック
      if (!content.includes('normalizeProduct') && servicePath.includes('product')) {
        issues.push({
          type: '正規化関数の欠如',
          file: servicePath,
          description: 'normalizeProduct関数が見つかりません',
          severity: 'medium'
        });
      }
      
      // データベースフィールドの直接マッピング
      const dbFields = ['image_url', 'affiliate_url', 'created_at', 'is_used'];
      dbFields.forEach(field => {
        if (content.includes(`product.${field}`) && !content.includes('normalizeProduct')) {
          issues.push({
            type: 'データベースフィールドの直接参照',
            file: servicePath,
            description: `${field}を正規化せずに使用している可能性があります`,
            severity: 'medium'
          });
        }
      });
    }
  });
  
  // 4. データベースとの整合性チェック
  console.log('4. データベースとの整合性チェック...\n');
  
  try {
    // external_productsテーブルの構造を取得
    const { data: tableInfo, error } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);
    
    if (!error && tableInfo && tableInfo.length > 0) {
      const dbFields = Object.keys(tableInfo[0]);
      console.log('データベースのフィールド:', dbFields.join(', '));
      
      // TypeScriptで使用されているがDBに存在しないフィールド
      const tsOnlyFields = ['imageUrl', 'affiliateUrl', 'createdAt', 'isUsed'];
      tsOnlyFields.forEach(field => {
        if (!dbFields.includes(field)) {
          // snake_case版をチェック
          const snakeCase = field.replace(/([A-Z])/g, '_$1').toLowerCase();
          if (dbFields.includes(snakeCase)) {
            issues.push({
              type: 'フィールド名の変換が必要',
              description: `TypeScript: ${field} → DB: ${snakeCase}`,
              severity: 'info'
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('データベースチェックエラー:', error);
  }
  
  // 5. データの整合性チェック
  console.log('\n5. データの整合性チェック...\n');
  
  try {
    // 価格が不正な商品
    const { data: invalidPrices, error: priceError } = await supabase
      .from('external_products')
      .select('id, title, price')
      .or('price.is.null,price.eq.0')
      .limit(5);
    
    if (!priceError && invalidPrices && invalidPrices.length > 0) {
      issues.push({
        type: '不正な商品データ',
        description: `価格が0または未設定の商品が${invalidPrices.length}件以上あります`,
        severity: 'medium',
        examples: invalidPrices.map(p => p.title).slice(0, 3)
      });
    }
    
    // タグが空の商品
    const { data: emptyTags, error: tagError } = await supabase
      .from('external_products')
      .select('id, title, tags')
      .or('tags.is.null,tags.eq.{}')
      .limit(5);
    
    if (!tagError && emptyTags && emptyTags.length > 0) {
      issues.push({
        type: '不完全な商品データ',
        description: `タグが設定されていない商品が${emptyTags.length}件以上あります`,
        severity: 'low',
        examples: emptyTags.map(p => p.title).slice(0, 3)
      });
    }
  } catch (error) {
    console.error('データ整合性チェックエラー:', error);
  }
  
  // 結果の表示
  console.log('\n=== 整合性チェック結果 ===\n');
  
  if (issues.length === 0) {
    console.log('✅ 整合性の問題は見つかりませんでした。');
  } else {
    console.log(`⚠️  ${issues.length}件の問題が見つかりました:\n`);
    
    // 重要度別に分類
    const severityOrder = ['high', 'medium', 'low', 'info'];
    const severityEmoji = {
      high: '🔴',
      medium: '🟠',
      low: '🟡',
      info: '🔵'
    };
    
    severityOrder.forEach(severity => {
      const severityIssues = issues.filter(i => i.severity === severity);
      if (severityIssues.length > 0) {
        console.log(`${severityEmoji[severity]} ${severity.toUpperCase()}:`);
        severityIssues.forEach(issue => {
          console.log(`  - ${issue.type}: ${issue.description}`);
          if (issue.file) {
            console.log(`    ファイル: ${issue.file}`);
          }
          if (issue.examples) {
            console.log(`    例: ${issue.examples.join(', ')}`);
          }
        });
        console.log('');
      }
    });
  }
  
  // 修正提案
  console.log('\n=== 修正提案 ===\n');
  console.log('1. Product型の統一:');
  console.log('   - snake_case版のフィールド（image_url等）を削除');
  console.log('   - normalizeProduct関数で一元的に変換\n');
  
  console.log('2. コンポーネントの修正:');
  console.log('   - すべてのコンポーネントでcamelCaseフィールドを使用');
  console.log('   - 例: product.imageUrl, product.affiliateUrl\n');
  
  console.log('3. サービス層の強化:');
  console.log('   - すべてのDBアクセス後にnormalizeProductを適用');
  console.log('   - 型安全性の向上\n');
  
  console.log('4. データ品質の改善:');
  console.log('   - 商品登録時のバリデーション強化');
  console.log('   - 必須フィールドの確認');
  
  // 結果をファイルに保存
  const reportPath = path.join(__dirname, '../consistency-check-report.md');
  const reportContent = `# Stilyaアプリ 整合性チェックレポート

生成日時: ${new Date().toISOString()}

## 発見された問題

${issues.map(issue => `
### ${issue.type}
- **重要度**: ${issue.severity}
- **説明**: ${issue.description}
${issue.file ? `- **ファイル**: ${issue.file}` : ''}
${issue.examples ? `- **例**: ${issue.examples.join(', ')}` : ''}
`).join('\n')}

## 推奨される修正

1. **Product型の統一**
   - snake_case版のフィールドを削除
   - normalizeProduct関数で一元的に変換

2. **コンポーネントの修正**
   - すべてのコンポーネントでcamelCaseフィールドを使用

3. **サービス層の強化**
   - DBアクセス後の正規化を徹底

4. **データ品質の改善**
   - バリデーション強化
`;
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nレポートを保存しました: consistency-check-report.md`);
}

// スクリプトを実行
checkCodeConsistency();
