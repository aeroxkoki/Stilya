# 初回表示時の商品フリッカー問題の修正レポート

## 📅 日付
2025年1月14日

## 🐛 問題の概要
オンボーディング画面とスワイプ画面の1枚目の表示時に、別の商品が一瞬表示される問題（フリッカー）が発生していました。

## 🔍 原因分析
1. **useProductsフックの初期状態管理**
   - 商品データの初期化時に、一時的に不整合な状態が発生
   - 初回ロード中にもかかわらず、空の商品配列から商品を取得しようとしていた

2. **StyledSwipeContainerの表示ロジック**
   - currentProductの存在チェックが不十分
   - 初期化中の状態を適切に処理していなかった

3. **SwipeScreenの表示条件**
   - 商品データの初期化状態を正しく判定していなかった
   - 複数の条件分岐が適切に組み合わされていなかった

## ✅ 実施した修正

### 1. useProducts.ts
- `isInitialLoad`フラグを`ProductsState`に追加
- 初回ロード中は`currentProduct`を`undefined`として返すように変更
- すべての商品データ更新時に`isInitialLoad`フラグを適切に管理

### 2. StyledSwipeContainer.tsx
- `currentProduct`の取得ロジックを改善
- 初期ロード中や商品配列が空の場合の表示制御を強化
- カードスタックの表示条件に`currentProduct`の存在チェックを追加

### 3. SwipeScreen.tsx
- 商品データが存在しない場合の表示ロジックを統一
- 初期ロード時と通常のローディングを適切に区別
- より一貫性のあるローディング表示を実装

## 🎯 改善効果
1. **フリッカーの完全解消**
   - 初回表示時に不適切な商品が表示される問題を根本的に解決
   - 一貫性のあるローディング表示により、ユーザー体験が向上

2. **パフォーマンスの向上**
   - 不要な再レンダリングを防止
   - 初期化プロセスが最適化

3. **コードの保守性向上**
   - 状態管理ロジックが明確化
   - デバッグが容易になる構造に改善

## 📝 技術的詳細

### ProductsState インターフェースの拡張
```typescript
interface ProductsState {
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
  allProductIds: Set<string>;
  isInitialLoad: boolean; // 新規追加
}
```

### currentProductの取得ロジック
```typescript
// 初回ロード中はundefinedを返す
const currentProduct = productsData.isInitialLoad 
  ? undefined 
  : productsData.products[currentIndex];
```

## ✨ 今後の推奨事項
1. 同様の初期化問題を防ぐため、他のフックでも`isInitialLoad`パターンの採用を検討
2. 状態管理ライブラリ（Zustand等）の導入による、より一元的な状態管理の実装
3. 商品プリロード戦略のさらなる最適化

## 📊 テスト結果
- ✅ オンボーディング画面での初回表示：フリッカーなし
- ✅ スワイプ画面での初回表示：フリッカーなし
- ✅ フィルター変更時の再読み込み：正常動作
- ✅ 商品枯渇時のリサイクル処理：正常動作

## 🚀 デプロイメント
修正内容はGitHubリポジトリにプッシュ済み。本番環境への反映準備完了。
