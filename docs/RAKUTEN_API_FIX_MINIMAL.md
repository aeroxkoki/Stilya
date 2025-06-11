# 楽天API実機テスト問題の修正

## 問題
`useProducts`フックで`fetchProducts`の呼び出し方が間違っていたため、実機で商品が取得できなかった。

## 原因
```typescript
// 間違い - オブジェクトとして渡していた
const response = await fetchProducts({
  page: page + 1,
  limit: pageSize,
});

// 正解 - 個別の引数として渡すべき
const response = await fetchProducts(pageSize, page * pageSize);
```

## 修正内容
1. `src/hooks/useProducts.ts`の1箇所を修正
   - fetchProductsの引数を修正
   - レスポンスのエラーハンドリングを追加

## 結果
最小限の修正（実質2行の変更）で問題を解決。
過剰な対応（デバッグ画面、環境変数の重複、大量のログ）は不要だった。

## 教訓
- まずはコードを丁寧に読む
- 型定義と実際の呼び出しが一致しているか確認する
- 最小限の修正から始める
- MVPの精神を忘れない
