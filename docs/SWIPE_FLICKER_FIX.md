# スワイプ画面フリッカー問題の修正レポート

## 問題の概要

スワイプ画面で、スワイプした前の画像が次の画像の前に瞬間的に表示される問題（フリッカー/フラッシュ）が発生していました。これによりユーザー体験が悪化していました。

## 問題の原因

### 1. 動的なReactのkey属性
`StyledSwipeContainer.tsx` で、カードコンポーネントのkey属性に動的な値を使用していたことが主な原因でした：

```javascript
// 問題のあったコード
key={`card-${currentIndex}-${index}`}
```

この実装では、`currentIndex` が変わるたびに全てのカードコンポーネントが新しいkeyを持つため、Reactは全てのカードを再作成し、画像も再ロードされていました。

### 2. コンポーネントの再レンダリング
カードコンポーネントがメモ化されていなかったため、親コンポーネントの状態変更時に不要な再レンダリングが発生していました。

## 実施した修正

### 1. key属性を商品IDベースに変更

**ファイル**: `src/components/swipe/StyledSwipeContainer.tsx`

```javascript
// 修正後のコード
key={product.id} // 商品IDをkeyとして使用し、再レンダリングを防ぐ
```

商品IDは変わらないため、Reactは既存のコンポーネントインスタンスを再利用し、画像の再ロードを防ぎます。

### 2. スタック表示の視覚的改善

背後のカードに対してスケールとトランスレーションを追加し、より自然なスタック表示を実現：

```javascript
transform: isTop ? [] : [
  { scale: 1 - (index * 0.05) }, // 背後のカードを少し小さく
  { translateY: index * 10 }, // 少しずらして立体感を出す
],
```

### 3. React.memoによるコンポーネントのメモ化

**ファイル**: `src/components/swipe/SwipeCardImproved.tsx`

```javascript
// React.memoでコンポーネントをラップ
const SwipeCardImproved: React.FC<SwipeCardImprovedProps> = memo(({
  // props...
}) => {
  // component logic...
}, (prevProps, nextProps) => {
  // カスタム比較関数で、必要な場合のみ再レンダリング
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isSaved === nextProps.isSaved &&
    prevProps.isTopCard === nextProps.isTopCard &&
    prevProps.cardIndex === nextProps.cardIndex
  );
});
```

### 4. 画像キャッシングの最適化

既存の `CachedImage` コンポーネントはExpo Imageを使用しており、メモリとディスクキャッシュが有効になっています。これにより、一度読み込まれた画像は再ロードされません。

## 結果

これらの修正により：

1. **フリッカーの解消**: 前の画像が瞬間的に表示される問題が解消されました
2. **パフォーマンス向上**: 不要な再レンダリングが削減され、スワイプ操作がスムーズになりました
3. **メモリ使用量の削減**: 画像の再ロードが減り、メモリ使用量が最適化されました

## テスト方法

1. アプリを起動し、スワイプ画面に移動
2. 商品を連続してスワイプ
3. 前の画像が瞬間的に表示されないことを確認
4. スワイプ操作のスムーズさを確認

## 今後の改善案

1. **プリロード戦略の最適化**: 次の5枚の画像を事前に読み込む設定を、デバイスの性能に応じて動的に調整
2. **遅延ロード**: 画面外のカードは遅延ロードすることで、初期表示を高速化
3. **画像サイズの最適化**: デバイスの画面サイズに応じた適切な画像サイズを要求

## 関連ファイル

- `/src/components/swipe/StyledSwipeContainer.tsx`
- `/src/components/swipe/SwipeCardImproved.tsx`
- `/src/components/common/CachedImage.tsx`

## 修正日時

2025年1月13日

## 修正者

Stilya開発チーム