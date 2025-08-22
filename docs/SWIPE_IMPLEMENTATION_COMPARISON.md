# スワイプ画面実装比較レポート

## 📊 実装の違い

### **結論: 異なる実装です**

オンボード画面（UnifiedSwipeScreen）とメインスワイプ画面（SwipeScreen）は**異なる実装**を使用しています。

## 🔍 詳細比較

### 1. **アーキテクチャの違い**

| 項目 | オンボード画面 (UnifiedSwipeScreen) | メインスワイプ画面 (SwipeScreen) |
|------|-------------------------------------|-----------------------------------|
| **コンポーネント構造** | 単一コンポーネントで全実装 | SwipeContainer（StyledSwipeContainer）を使用 |
| **アニメーション** | react-native-reanimated v2 | React Native標準のAnimated API |
| **ジェスチャー** | PanGestureHandler | PanResponder |
| **カード表示** | **カードスタック（3枚同時表示）** | 1枚ずつ表示 |
| **カードコンポーネント** | OnboardingSwipeCard（専用） | SwipeCardImproved（汎用） |

### 2. **UX/機能の違い**

| 機能 | オンボード画面 | メインスワイプ画面 |
|------|--------------|-----------------|
| **カードスタック** | ✅ あり（最大3枚） | ❌ なし |
| **次のカードの先読み** | ✅ 見える | ❌ 見えない |
| **お気に入り機能** | ❌ なし | ✅ あり |
| **詳細画面遷移** | ❌ なし | ✅ あり |
| **フィルター機能** | ❌ なし | ✅ あり |
| **商品追加読み込み** | ❌ なし（8枚固定） | ✅ あり（無限スクロール） |
| **チュートリアル** | ✅ あり | ❌ なし |
| **進捗表示** | ✅ あり（プログレスバー） | ❌ なし |

### 3. **技術的な実装の違い**

#### **オンボード画面の特徴**
```typescript
// カードごとの独立したアニメーション管理
interface CardAnimationState {
  translateX: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  rotate: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

// カードスタック表示
const MAX_VISIBLE_CARDS = 3;
const CARD_STACK_OFFSET = 12;
```

#### **メインスワイプ画面の特徴**
```typescript
// SwipeContainerを使用
<SwipeContainer
  products={products}
  isLoading={isLoading}
  onSwipe={handleSwipe}
  currentIndex={currentIndex}
  onCardPress={(product) => navigation.navigate('ProductDetail', ...)}
  onLoadMore={loadMore}
  hasMoreProducts={hasMore}
  useEnhancedCard={true}
/>
```

### 4. **パフォーマンスの違い**

| 項目 | オンボード画面 | メインスワイプ画面 |
|------|--------------|-----------------|
| **アニメーション性能** | ⚡ 高速（reanimated v2） | 🔄 標準 |
| **メモリ使用量** | 📈 やや多い（3枚同時） | 📊 少ない（1枚） |
| **スムーズさ** | ✨ 非常にスムーズ | ✅ スムーズ |

## 🎯 なぜ異なる実装を使用しているか

### **オンボード画面の設計思想**
- **体験重視**: 初回ユーザーに楽しい体験を提供
- **学習用**: スワイプ操作を教える（チュートリアル）
- **固定枚数**: 8枚で完了（進捗が見える）
- **シンプル**: 余計な機能を排除

### **メインスワイプ画面の設計思想**
- **機能重視**: 実用的な機能を多数搭載
- **継続利用**: 無限にスワイプ可能
- **商品探索**: フィルター、お気に入り、詳細表示
- **データ効率**: 必要に応じて商品を追加読み込み

## 🔄 統一すべきか？

### **現状維持を推奨する理由**

1. **目的が異なる**
   - オンボード: 初回体験・学習
   - メイン: 日常利用・商品探索

2. **パフォーマンス最適化**
   - オンボード: アニメーション重視
   - メイン: データ効率重視

3. **複雑性の管理**
   - それぞれ独立して最適化可能
   - 要件変更時の影響範囲が限定的

### **統一する場合の考慮点**

もし統一したい場合は：
1. メインスワイプ画面にカードスタック機能を追加
2. react-native-reanimated v2への移行
3. 条件分岐によるモード切り替え実装

ただし、現在の実装は**それぞれの目的に最適化**されているため、統一は推奨しません。

## 📝 まとめ

- **異なる実装**を使用している
- **意図的な設計**による差別化
- それぞれの**目的に最適化**されている
- 統一は可能だが、**現状維持を推奨**
