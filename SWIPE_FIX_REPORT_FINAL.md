# スワイプ機能修正レポート（完全版）

## 修正日時
2025年1月14日

## 問題の症状
- 1枚目のカードはスワイプ可能
- 2枚目以降のカードがスワイプできない
- カードは表示されるが、ジェスチャーが反応しない

## 根本原因

### 1. アニメーション状態の管理問題
`SwipeCardImproved.tsx` において、`completeSwipe` 関数でスワイプアニメーション完了後に `isAnimating` フラグがリセットされていなかった。

```javascript
// 修正前
.start(() => {
  if (direction === 'left' && onSwipeLeft) {
    onSwipeLeft();
  } else if (direction === 'right' && onSwipeRight) {
    onSwipeRight();
  }
  // 状態リセットは次のカード表示時に行う（useEffectで処理）← この設計に問題
});
```

この結果、1枚目のカードをスワイプした後、`isAnimating` が `true` のまま固定され、新しいカードのPanResponderが動作しなくなっていた。

### 2. 商品変更時の状態リセット問題
新しい商品に切り替わった際の状態リセットが、アニメーション状態に依存していたため、適切にリセットされなかった。

### 3. React のキー属性問題
カードのキーが商品IDのみだったため、同じ商品が再度表示される可能性がある場合、Reactが新しいコンポーネントとして認識せず、状態が正しくリセットされなかった。

## 実施した修正

### 1. SwipeCardImproved.tsx の修正

#### アニメーション完了後の状態リセット
```javascript
// 修正後
.start(() => {
  if (direction === 'left' && onSwipeLeft) {
    onSwipeLeft();
  } else if (direction === 'right' && onSwipeRight) {
    onSwipeRight();
  }
  // 【修正】アニメーション状態をリセット
  setIsAnimating(false);
  setIsSwiping(false);
  // 位置とインジケータをリセット
  animValues.position.setValue({ x: 0, y: 0 });
  animValues.likeOpacity.setValue(0);
  animValues.nopeOpacity.setValue(0);
  setSwipeDirection(null);
});
```

#### 商品変更時の強制リセット
```javascript
// productが変更されたらアニメーション値をリセット
useEffect(() => {
  // 新しい商品に切り替わったとき、強制的に状態をリセット
  console.log('[SwipeCardImproved] Product changed, resetting states for:', product.id);
  animValues.position.setValue({ x: 0, y: 0 });
  animValues.likeOpacity.setValue(0);
  animValues.nopeOpacity.setValue(0);
  animValues.cardOpacity.setValue(1); // カードの不透明度もリセット
  setSwipeDirection(null);
  setIsSwiping(false);
  setIsAnimating(false);
}, [product.id]);
```

#### PanResponder の依存配列に product.id を追加
```javascript
const panResponder = useMemo(() => {
  return PanResponder.create({
    // ...
  });
}, [isTopCard, isSwiping, isAnimating, onSwipeLeft, onSwipeRight, product.id]); // product.idを追加
```

### 2. StyledSwipeContainer.tsx の修正

#### より一意性の高いキー属性
```javascript
// 修正前
key={`card-${product.id}`}

// 修正後
key={`card-${currentIndex + index}-${product.id}`}
```

## テスト項目

### 動作確認チェックリスト
- [ ] 1枚目のカードが左右にスワイプできる
- [ ] 2枚目のカードが左右にスワイプできる
- [ ] 3枚目以降も継続してスワイプできる
- [ ] スワイプアニメーションがスムーズに動作する
- [ ] カードのボタン（No/Save/Yes）が正しく動作する
- [ ] 商品詳細画面への遷移が正常に動作する
- [ ] フィルター適用後もスワイプが正常に動作する
- [ ] 商品リロード後もスワイプが正常に動作する

### デバッグ用ログの確認方法
```bash
# Expo実行時のコンソールで以下のログを確認
[SwipeCardImproved] Product changed, resetting states for: [商品ID]
[SwipeCardImproved] Creating PanResponder for product: [商品ID]
[SwipeCardImproved] onStartShouldSetPanResponder: true/false
```

## 今後の改善提案

1. **状態管理の統合化**
   - 現在分散している状態（isAnimating, isSwiping）を統合管理することで、より堅牢な実装にできる

2. **エラーリカバリー機能**
   - アニメーション中にエラーが発生した場合の自動リセット機能の実装

3. **パフォーマンス最適化**
   - メモ化の範囲を拡大し、不要な再レンダリングをさらに削減

## まとめ
スワイプ機能の問題は、アニメーション状態管理の不備が主な原因でした。今回の修正により、状態管理を適切に行い、Reactのコンポーネントライフサイクルに沿った実装に改善しました。これにより、継続的にスワイプが可能になります。
