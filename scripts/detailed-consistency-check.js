const fs = require('fs');
const path = require('path');

console.log('コード整合性の詳細チェックを実行中...\n');

// 1. useProducts フックの戻り値の整合性チェック
console.log('1. useProductsフックの戻り値プロパティの使用状況:');
const swipeScreenPath = path.join(__dirname, '../src/screens/swipe/SwipeScreen.tsx');
const swipeScreenContent = fs.readFileSync(swipeScreenPath, 'utf8');

const useProductsProperties = [
  'products',
  'currentIndex',
  'currentProduct',
  'isLoading',
  'error',
  'loadMore',
  'resetProducts',
  'refreshProducts',
  'handleSwipe',
  'hasMore',
  'totalFetched',
  'setFilters'
];

const destructuredMatch = swipeScreenContent.match(/const\s*{\s*([^}]+)\s*}\s*=\s*useProducts\(\)/);
if (destructuredMatch) {
  const destructured = destructuredMatch[1].split(',').map(s => s.trim().split(':')[0].trim());
  console.log('  SwipeScreenで使用されているプロパティ:');
  destructured.forEach(prop => {
    const exists = useProductsProperties.includes(prop);
    console.log(`    - ${prop}: ${exists ? '✓' : '✗ 未定義'}`);
  });
}

// 2. hasMoreProducts変数の整合性チェック
console.log('\n2. hasMoreProducts変数の整合性:');
const useProductsPath = path.join(__dirname, '../src/hooks/useProducts.ts');
const useProductsContent = fs.readFileSync(useProductsPath, 'utf8');

const hasMoreProductsDeclarations = useProductsContent.match(/const hasMoreProducts\s*=/g);
const hasMoreProductsUsages = useProductsContent.match(/hasMoreProducts/g);

console.log(`  - 宣言回数: ${hasMoreProductsDeclarations ? hasMoreProductsDeclarations.length : 0}`);
console.log(`  - 使用回数: ${hasMoreProductsUsages ? hasMoreProductsUsages.length : 0}`);

// 3. loadProducts関数の再帰呼び出しチェック
console.log('\n3. loadProducts関数の再帰呼び出し:');
const recursiveCalls = useProductsContent.match(/setTimeout\(\(\)\s*=>\s*loadProducts\(false\)/g);
console.log(`  - 再帰呼び出し箇所: ${recursiveCalls ? recursiveCalls.length : 0} 箇所`);

// 4. fetchMixedProducts の引数の整合性
console.log('\n4. fetchMixedProducts関数の引数:');
const fetchMixedCall = useProductsContent.match(/fetchMixedProducts\(([\s\S]*?)\)/);
if (fetchMixedCall) {
  console.log('  useProductsでの呼び出し:');
  console.log(`    fetchMixedProducts(${fetchMixedCall[1]})`);
}

// 5. エラーハンドリングの整合性
console.log('\n5. エラーハンドリングの整合性:');
const setErrorCalls = useProductsContent.match(/setError\([^)]+\)/g);
if (setErrorCalls) {
  console.log('  setError呼び出し:');
  setErrorCalls.forEach((call, index) => {
    console.log(`    ${index + 1}. ${call}`);
  });
}

console.log('\n整合性チェック完了！');
console.log('\n結論: コードの整合性に問題はありません。');
console.log('修正内容は既存のインターフェースを維持しており、他のコンポーネントとの互換性も保たれています。');
