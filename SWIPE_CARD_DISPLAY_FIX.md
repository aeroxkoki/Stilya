# スワイプ後のカード表示問題の根本的解決

## 問題の概要
スワイプ画面で1枚目の商品をスワイプした後、次のカードが正しく表示されない問題が発生していました。

## 根本原因
`useProducts`フックの`handleSwipe`関数において、インデックス更新の条件に問題がありました：

```typescript
// 問題のあったコード
if (nextIndex < productsData.products.length || productsData.hasMore) {
  setCurrentIndex(nextIndex);
}
```

この条件では、`hasMore`がtrueの場合、まだ配列に存在しない商品のインデックスに更新してしまう可能性がありました。

## 解決策
インデックス更新のロジックを以下のように修正しました：

1. **実際の商品存在チェック**: 次の商品が配列に実際に存在する場合のみインデックスを更新
2. **ローディング中の処理**: 新しい商品を読み込み中の場合は、現在のインデックスを維持
3. **商品なしの処理**: すべての商品をスワイプし終わった場合の適切な処理

## 実装内容

### useProducts.ts の修正
```typescript
// 修正後のコード
if (nextIndex < productsData.products.length) {
  // 次の商品が実際に存在する
  setCurrentIndex(nextIndex);
  console.log(`[useProducts] Updated currentIndex to ${nextIndex} (product exists)`);
} else if (productsData.hasMore && loadingRef.current) {
  // 新しい商品を読み込み中の場合は、現在のインデックスを維持
  console.log('[useProducts] Waiting for new products to load, keeping current index');
} else if (!productsData.hasMore) {
  // もう商品がない場合
  console.log('[useProducts] No more products available');
  // インデックスは更新しない（最後の商品を表示し続ける）
} else {
  // その他の場合（通常は発生しないが、念のため）
  console.log('[useProducts] Edge case: keeping current index');
}
```

## 効果
1. **安定性向上**: インデックスが配列の範囲を超えることがなくなり、undefined エラーが解消
2. **スムーズな体験**: スワイプ後も次のカードが確実に表示される
3. **適切なローディング**: 新しい商品の読み込み中も現在のカードを表示し続ける

## テスト結果
- ✅ 1枚目のスワイプ後、2枚目のカードが正しく表示される
- ✅ 連続スワイプしても安定して動作する
- ✅ 商品の追加ローディング中も現在のカードが維持される
- ✅ 最後の商品に到達しても適切に処理される

## 追加改善点
- デバッグログを追加して、状態の可視性を向上
- エッジケースへの対応を強化
- コードの可読性を改善

## まとめ
この修正により、スワイプ機能の根本的な問題が解決され、ユーザーエクスペリエンスが大幅に改善されました。
