# オンボーディングスワイプ遷移問題の修正報告

## 問題の概要
オンボーディング画面で2回スワイプした後、次の画面に遷移しない問題が発生していました。

## 根本原因

### 1. React Native Reanimated の不適切な使用
```typescript
// 問題のあるコード
useEffect(() => {
  const animations: CardAnimationState[] = [];
  for (let i = 0; i < TOTAL_CARDS; i++) {
    animations.push({
      translateX: useSharedValue(0), // ❌ useEffectの中でuseSharedValueを使用
      // ...
    });
  }
  setCardAnimations(animations);
}, []);
```

`useSharedValue`はReactのフックであり、`useEffect`内で使用することは推奨されません。

### 2. スワイプ完了処理のタイミング問題
```typescript
// 問題のあるコード
setTimeout(() => {
  setCurrentIndex(prev => prev + 1);
  setIsProcessing(false);
}, 100);
```

`setTimeout`の使用により、状態更新のタイミングが不安定になっていました。

### 3. 商品数のチェックロジックの不整合
商品の実際の数とTOTAL_CARDSの定数の間で不整合が生じ、適切な遷移判定ができていませんでした。

## 実装した修正

### 1. カードアニメーション用のカスタムフックを作成
```typescript
const useCardAnimation = (index: number, isVisible: boolean) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(isVisible ? index * CARD_STACK_OFFSET : 0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(isVisible ? 1 - (index * 0.05) : 0);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  return { translateX, translateY, rotate, scale, opacity };
};
```

### 2. 個別のアニメーション値を初期化
```typescript
const card0Anim = useCardAnimation(0, true);
const card1Anim = useCardAnimation(1, true);
const card2Anim = useCardAnimation(2, true);
// ... 8枚分のカード

const cardAnimations = [
  card0Anim, card1Anim, card2Anim, card3Anim,
  card4Anim, card5Anim, card6Anim, card7Anim
];
```

### 3. requestAnimationFrameを使用した適切なタイミング制御
```typescript
if (currentIndex < TOTAL_CARDS - 1 && currentIndex < selectedProducts.length - 1) {
  // 次のカードへ進む
  requestAnimationFrame(() => {
    setCurrentIndex(prev => prev + 1);
    setIsProcessing(false);
  });
} else {
  // 完了処理
  setTimeout(async () => {
    await setStyleQuizResults(newResults);
    nextStep();
    navigation.navigate('StyleReveal');
  }, 300);
}
```

### 4. 商品数の適切な管理
```typescript
// 8枚になるように調整
const allSelectedProducts = [...tutorialProducts, ...personalizedProducts];
while (allSelectedProducts.length < TOTAL_CARDS && products.length > allSelectedProducts.length) {
  const remainingProducts = products.filter(p => 
    !allSelectedProducts.some(sp => sp.id === p.id)
  );
  if (remainingProducts.length > 0) {
    allSelectedProducts.push(remainingProducts[0]);
  } else {
    break;
  }
}

const actualTotalCards = Math.min(TOTAL_CARDS, selectedProducts.length);
```

## 改善された動作

1. **スムーズな遷移**: 2枚目のスワイプ後、適切に3枚目のカードに遷移
2. **安定したアニメーション**: React Native Reanimatedの正しい使用により、アニメーションが安定
3. **適切な完了判定**: 実際の商品数に基づいた正確な完了判定
4. **エラーハンドリング**: 商品が不足している場合の適切な処理

## テスト項目

- [x] 1枚目のスワイプが正常に動作
- [x] 2枚目のスワイプ後、3枚目に遷移
- [x] 8枚すべてスワイプ後、StyleReveal画面に遷移
- [x] スワイプアニメーションがスムーズ
- [x] ボタンでのスワイプも正常動作
- [x] プログレスバーが正確に更新

## パフォーマンスの最適化

- `requestAnimationFrame`の使用により、ブラウザの描画サイクルと同期
- 不要な再レンダリングを防ぐための`useCallback`の適切な使用
- アニメーション値の初期化を一度だけ実行

## 今後の改善提案

1. **エラーリカバリー**: ネットワークエラー時の再試行機能
2. **プリロード**: 次のカードの画像を事前に読み込む
3. **アクセシビリティ**: VoiceOver対応の改善
4. **アナリティクス**: スワイプパターンの詳細な追跡

## 結論
React Native Reanimatedの使用方法を修正し、状態管理のタイミングを適切に制御することで、オンボーディング画面の遷移問題を根本的に解決しました。これにより、ユーザーエクスペリエンスが大幅に改善されました。
