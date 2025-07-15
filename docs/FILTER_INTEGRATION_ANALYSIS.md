# フィルター機能 整合性分析レポート

## 概要
Stilyaアプリのスワイプ画面とおすすめ画面に実装されたフィルター機能の整合性を確認し、問題点と改善案を提示します。

## 実装状況

### ✅ 正しく実装されている部分

1. **グローバルフィルター管理**
   - `FilterContext`でアプリ全体のフィルター状態を一元管理
   - AsyncStorageによる永続化対応
   - スマートデフォルト機能（ユーザーの履歴から最適な初期値を設定）

2. **UIの統一性**
   - `SimpleFilterModal`コンポーネントを両画面で共通使用
   - フィルターアクティブ状態の視覚的フィードバック（赤いドット）

3. **基本的なフィルター連携**
   - 両画面でuseFilters()フックを使用
   - フィルター変更時の自動再読み込み

## ⚠️ 発見された問題点

### 1. 中古品フィルターの不整合
**問題**: FilterOptionsインターフェースに`includeUsed`プロパティがないが、ProductFilterOptionsには存在する

```typescript
// FilterContext.tsx
export interface FilterOptions {
  priceRange: [number, number];
  style?: string;
  moods: string[];
  // includeUsed?: boolean; // これが欠けている
}
```

**影響**: 
- integratedRecommendationServiceで中古品を手動でフィルタリングしている
- ユーザーが中古品の表示/非表示を制御できない

### 2. 気分タグ「人気」の実装不完全
**問題**: 「人気」フィルターがタグベースの簡易実装になっている

```typescript
// productService.ts
if (filters.moods.includes('人気')) {
  // TODO: 将来的にはスワイプ数を集計する別テーブルまたはビューを作成して対応
  filteredQuery = filteredQuery.contains('tags', ['人気', 'トレンド', 'ベストセラー']);
}
```

**影響**: 
- 実際のユーザー行動に基づく人気度が反映されない
- 静的なタグに依存するため精度が低い

### 3. EnhancedRecommendScreenでのフィルター適用が部分的
**問題**: getEnhancedRecommendations()にフィルターを渡しているが、完全には適用されていない

```typescript
// EnhancedRecommendScreen.tsx
const [recommendationResults] = await Promise.all([
  getEnhancedRecommendations(
    user.id, 
    100,  // 大量に取得している
    [], 
    globalFilters  // フィルターを渡しているが...
  )
]);
```

**影響**: 
- トレンド商品やforYou商品に対してフィルターが部分的にしか適用されない
- ユーザーの期待する結果と異なる可能性

### 4. fetchProducts関数でのフィルター変換の二重処理
**問題**: FilterOptionsとProductFilterOptionsの変換が複数箇所で行われている

## 🔧 改善提案

### 1. FilterOptionsインターフェースの拡張
```typescript
export interface FilterOptions {
  priceRange: [number, number];
  style?: string;
  moods: string[];
  includeUsed?: boolean;  // 追加
}
```

### 2. 人気商品の動的計算
- swipesテーブルを集計するビューまたは関数を作成
- 過去7日間/30日間のスワイプ数でランキング

### 3. フィルター適用の統一化
- すべての商品取得関数でapplyFiltersToQuery()を使用
- integratedRecommendationServiceでも一貫した適用

### 4. SimpleFilterModalへの中古品トグル追加
```typescript
// 中古品を含むトグルスイッチを追加
<Switch
  value={globalFilters.includeUsed ?? true}
  onValueChange={(value) => setIncludeUsed(value)}
/>
```

## 📝 実装優先順位

1. **高優先度**
   - FilterOptionsインターフェースの拡張
   - フィルター適用の統一化

2. **中優先度**
   - 中古品フィルターUIの追加
   - EnhancedRecommendScreenでのフィルター完全適用

3. **低優先度**
   - 人気商品の動的計算実装
   - スマートデフォルトの精度向上

## まとめ
基本的なフィルター機能は実装されていますが、いくつかの整合性の問題があります。特に中古品フィルターの欠落と、フィルター適用の不統一は早急に対処すべき課題です。
