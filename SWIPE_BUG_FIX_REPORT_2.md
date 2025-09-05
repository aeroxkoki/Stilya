# スワイプ機能バグ修正レポート

## 問題の概要
オンボーディング画面終了後、スワイプ画面に遷移し、1枚目の商品カードをスワイプした後、2枚目をスワイプできない問題が発生していました。

## 発生日時
2025年9月5日

## 原因分析

### 根本原因
`useProducts.ts`のhandleSwipe関数内で、インデックス更新ロジックに問題がありました：

1. **問題のコード（修正前）**：
   - インデックスを商品配列の長さを超えて進めてしまう
   - 商品が存在しない状態でもインデックスを更新
   - 結果として`currentProduct`が`undefined`になり、画面が表示されない

2. **具体的な問題点**：
   ```typescript
   // 問題：商品がない場合でもインデックスを進めていた
   if (productsData.hasMore) {
     setCurrentIndex(nextIndex); // これが問題
   }
   ```

## 実施した修正

### 1. インデックス更新ロジックの改善
- 次の商品が確実に存在する場合のみインデックスを進める
- 商品がない場合はインデックスを更新せず、商品のロードを待つ
- currentProductがundefinedになることを防ぐ

### 2. 自動インデックス進行機能の追加
- 新しい商品がロードされた後、待機中だった場合は自動的にインデックスを進める
- これにより、ユーザーはスムーズに次の商品を見ることができる

### 3. 修正箇所
- `/src/hooks/useProducts.ts`
  - handleSwipe関数内のインデックス更新ロジック
  - loadProducts関数内で商品追加後の自動インデックス進行処理

## 修正コード詳細

### handleSwipe関数の修正
```typescript
// 【修正】インデックス更新のロジックを改善
// 次の商品が確実に存在する場合のみインデックスを進める
if (nextIndex < productsData.products.length) {
  // 次の商品が存在することを確認
  const nextProduct = productsData.products[nextIndex];
  if (nextProduct) {
    setCurrentIndex(nextIndex);
    console.log(`[useProducts] ✅ Updated currentIndex to ${nextIndex}`);
    console.log(`[useProducts] Next product: ${nextProduct.title}`);
  } else {
    // 次の商品が存在しない場合はインデックスを更新しない
    console.log(`[useProducts] ⚠️ Next product at index ${nextIndex} is undefined, not updating index`);
  }
} else {
  // 商品がない場合の処理
  if (productsData.hasMore) {
    console.log('[useProducts] ⏳ No more products in current list, loading more...');
    // 商品のロードを開始するが、インデックスは更新しない
    if (!loadingRef.current) {
      console.log('[useProducts] Starting immediate product load');
      loadMore(false);
    }
    // ローディング中はインデックスを更新しない
  }
}
```

### loadProducts関数の修正
```typescript
// 【新規追加】商品追加後、待機中だった場合はインデックスを自動的に進める
if (wasWaitingForProducts && !reset && sortedProducts.length > 0) {
  // 前のインデックスが商品配列の長さ以上だった場合、次の商品へ進む
  const newProductsStartIndex = productsData.products.length;
  if (prevIndex >= productsData.products.length - 1 && prevIndex < newProductsStartIndex + sortedProducts.length) {
    console.log('[useProducts] 🔄 Auto-advancing index after products loaded');
    // 新しい商品の最初のインデックスへ移動
    setCurrentIndex(newProductsStartIndex);
  }
}
```

## テスト結果

### テスト項目
1. ✅ オンボーディング完了後のスワイプ画面表示
2. ✅ 1枚目の商品カードのスワイプ
3. ✅ 2枚目の商品カードの表示とスワイプ
4. ✅ 連続したスワイプ操作
5. ✅ 商品ローディング中の表示
6. ✅ 商品がなくなった場合の処理

### 確認環境
- Expo Go iOS/Android
- React Native (Expo SDK 53)
- TypeScript

## 影響範囲
- スワイプ画面全体の動作改善
- ユーザー体験の向上（スムーズなカード切り替え）
- エラー表示の削減

## 今後の推奨事項

1. **パフォーマンス最適化**
   - 商品のプリロード数を調整
   - 画像のプリフェッチタイミングを最適化

2. **エラーハンドリング強化**
   - ネットワークエラー時の再試行処理
   - オフライン時の動作改善

3. **UX改善**
   - ローディング中のアニメーション追加
   - スワイプジェスチャーのフィードバック強化

## まとめ
このバグ修正により、スワイプ機能の根本的な問題が解決され、ユーザーはスムーズに商品をスワイプできるようになりました。インデックス管理の改善により、今後同様の問題が発生することを防ぐことができます。
