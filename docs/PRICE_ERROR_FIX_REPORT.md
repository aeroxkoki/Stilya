# 価格比較エラーと年代フォーマット変換の修正レポート

## 発生日時
2025年1月16日

## エラー内容

### 1. 価格比較エラー
```
ERROR ** Error fetching products: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type integer: \"1398.6\""}
```

このエラーは、PostgreSQL の `external_products` テーブルの `price` フィールド（integer型）に対して、小数値（1398.6）を比較しようとしたことによる型不一致エラーです。

### 2. 年代フォーマットの不一致
- アプリが送信する形式: `"20-29"`, `"30-39"` など
- サービスが期待する形式: `"twenties"`, `"thirties"` など

## 原因

### 1. 価格比較の問題
`personalizedProductService.ts` で価格範囲を計算する際に、小数が発生していました：
```typescript
// 修正前
query = query.gte('price', priceRange.min * 0.8) // 小数になる可能性
             .lte('price', priceRange.max * 1.2);
```

### 2. 年代フォーマットの問題
オンボーディング画面では `"20-29"` 形式で年代を送信していたが、`personalizedProductService.ts` は `"twenties"` 形式を期待していました。

## 修正内容

### 1. 価格比較の修正
`/src/services/personalizedProductService.ts`:
```typescript
// 修正後
const minPrice = Math.floor(priceRange.min * 0.8); // 整数に丸める
const maxPrice = Math.ceil(priceRange.max * 1.2);  // 整数に丸める

query = query.gte('price', minPrice)
             .lte('price', maxPrice);
```

同様に、スコアリング関数でも価格を整数として扱うように修正：
```typescript
const intPrice = Math.floor(price);
if (intPrice >= priceRange.min && intPrice <= priceRange.max) {
  // 価格スコアの計算
}
```

### 2. 年代フォーマット変換の追加
新しいヘルパー関数を追加：
```typescript
function convertAgeGroupFormat(ageGroup?: string): string | undefined {
  if (!ageGroup) return undefined;
  
  const ageMapping: Record<string, string> = {
    '10-19': 'teens',
    '20-29': 'twenties',
    '30-39': 'thirties',
    '40-49': 'forties',
    '40+': 'forties',
    '50+': 'fifties_plus',
    // 既存の形式もサポート
    'teens': 'teens',
    'twenties': 'twenties',
    'thirties': 'thirties',
    'forties': 'forties',
    'fifties_plus': 'fifties_plus'
  };
  
  return ageMapping[ageGroup] || ageGroup;
}
```

`getPersonalizedProducts` 関数で使用：
```typescript
const normalizedConfig = {
  ...config,
  ageGroup: convertAgeGroupFormat(config.ageGroup)
};
```

## 影響範囲
- `src/services/personalizedProductService.ts` のみ
- 他のサービスは `getPersonalizedProducts` を呼び出しているため、自動的に修正が適用される

## テスト方法
1. ExpoGoアプリで新規オンボーディングを実行
2. 年代を選択（例：20-29）
3. スタイルを選択
4. スワイプ画面に遷移
5. 商品が正常に表示されることを確認

## 今後の改善点
1. 型安全性の向上: `ageGroup` を文字列型ではなく、明確な型定義を使用
2. バリデーション: データベースに保存する前の価格データのバリデーション強化
3. エラーハンドリング: より詳細なエラーメッセージとフォールバック処理

## コミット情報
- コミットハッシュ: `ad595e4`
- メッセージ: `Fix: 価格比較エラーと年代フォーマット変換の修正`
