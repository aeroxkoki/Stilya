#!/bin/bash

echo "整合性チェックを実行中..."
echo ""

# 1. useProductsフックの戻り値の型を確認
echo "1. useProductsフックの使用箇所をチェック..."
grep -n "const {.*} = useProducts()" src/screens/swipe/SwipeScreen.tsx || echo "  SwipeScreen.tsx - OK"

# 2. fetchMixedProductsの戻り値の型を確認
echo ""
echo "2. fetchMixedProductsの戻り値を確認..."
grep -A 2 "fetchMixedProducts" src/hooks/useProducts.ts | grep -E "success|data|error" || echo "  戻り値の型 - OK"

# 3. hasMoreProducts変数の確認
echo ""
echo "3. hasMoreProducts変数の使用箇所を確認..."
grep -n "hasMoreProducts" src/hooks/useProducts.ts | wc -l | xargs -I {} echo "  hasMoreProducts使用箇所: {} 箇所"

# 4. 重要な変数名の一貫性チェック
echo ""
echo "4. 変数名の一貫性チェック..."
grep -n "swipedProductsRef" src/hooks/useProducts.ts | wc -l | xargs -I {} echo "  swipedProductsRef: {} 箇所"
grep -n "loadingRef" src/hooks/useProducts.ts | wc -l | xargs -I {} echo "  loadingRef: {} 箇所"
grep -n "filtersRef" src/hooks/useProducts.ts | wc -l | xargs -I {} echo "  filtersRef: {} 箇所"

# 5. エラーハンドリングの確認
echo ""
echo "5. エラーハンドリングの確認..."
grep -n "setError" src/hooks/useProducts.ts | wc -l | xargs -I {} echo "  setError呼び出し: {} 箇所"

echo ""
echo "整合性チェック完了！"
