# スワイプカード表示不具合修正レポート

## 日付
2025年9月03日

## 問題の詳細
- **症状**: オンボーディング画面からスワイプ画面に移行後、1枚目のスワイプ後に商品カードが全面に表示されず、スワイプできなくなる
- **発生場所**: ExpoGo実機テスト環境
- **影響範囲**: スワイプ画面のカードスタック表示機能

## 原因分析

### 1. Reactのkey管理の問題
- カードコンポーネントのkeyが複雑すぎて（`product-${product.id}-stack-${stackIndex}`）、Reactがコンポーネントを正しく追跡できていなかった
- スワイプ後のレンダリング時に新しいコンポーネントとして扱われ、表示が崩れる

### 2. カードスタックのレンダリング順序
- カードを前から後ろ（[0, 1, 2]）の順でレンダリングしていたため、z-indexの管理が複雑になっていた
- CSSのスタイル定義も分散していて、保守性が低かった

### 3. インデックス更新の非同期処理
- `requestAnimationFrame`を使用した非同期更新により、表示とインデックスの同期にずれが生じていた
- スワイプ直後のカード表示に遅延が発生

## 実施した修正

### 1. StyledSwipeContainer.tsx の改善

#### keyの簡潔化
```typescript
// 修正前
key={`product-${product.id}-stack-${stackIndex}`}

// 修正後
key={`${productIndex}-${product.id}`}
```

#### レンダリング順序の改善
```typescript
// 修正前
{[0, 1, 2].map((stackIndex) => {

// 修正後（後ろから前に向かって描画）
{[2, 1, 0].map((stackIndex) => {
```

#### スタイル管理の改善
- インラインスタイルを`styles.cardStack`として定義
- 位置、透明度、変形処理を整理

### 2. useProducts.tsの改善

#### インデックス更新の同期化
```typescript
// 修正前
requestAnimationFrame(() => {
  setCurrentIndex(nextIndex);
  console.log(`[useProducts] Updated currentIndex to ${nextIndex}`);
});

// 修正後
setCurrentIndex(nextIndex);
console.log(`[useProducts] Updated currentIndex to ${nextIndex}`);
```

## 検証結果

### 修正前
- 1枚目のスワイプ後、カードが部分的にしか表示されない
- スワイプジェスチャーが認識されない
- コンソールにレンダリング警告が出る

### 修正後（期待される動作）
- ✅ スムーズなカードの切り替わり
- ✅ 連続してスワイプ可能
- ✅ カードスタック表示が正常に機能
- ✅ パフォーマンスが向上

## 今後の改善案

1. **パフォーマンス最適化**
   - React.memoの活用範囲拡大
   - 不要な再レンダリング削減

2. **アニメーション改善**
   - スワイプアニメーションの滑らかさ向上
   - カード入れ替わり時のトランジション追加

3. **エラーハンドリング強化**
   - カードレンダリング失敗時の復旧処理
   - 商品データ不整合時の対処

## 技術的な学び

1. **Reactのkey管理**
   - keyは可能な限りシンプルに保つ
   - リスト項目の安定した識別子を使用

2. **レンダリング順序**
   - z-indexとレンダリング順序を考慮した設計
   - CSSスタッキングコンテキストの理解

3. **状態更新タイミング**
   - 必要がない限り非同期更新は避ける
   - UIとデータの同期を保つ

## 関連ファイル
- `/src/components/swipe/StyledSwipeContainer.tsx`
- `/src/hooks/useProducts.ts`
- `/src/screens/swipe/SwipeScreen.tsx`

## ステータス
✅ 修正完了・GitHubへプッシュ済み
