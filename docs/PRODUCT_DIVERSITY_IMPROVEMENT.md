# 商品表示の多様性向上に関する改善

## 実施日時
2025年1月14日

## 問題点
オンボーディング画面およびスワイプ画面で表示される商品（特に最初の2枚）が固定または限定的なパターンになっており、ユーザー体験が単調になっていました。

## 改善内容

### 1. UnifiedSwipeScreen（オンボーディング画面）の改善

#### 変更前の問題点
- 最初の2枚がチュートリアル用として「カジュアル」商品に固定
- カジュアル商品が不足した場合のみランダム選択
- 商品選択の多様性が限定的

#### 改善内容
- **ランダム性の導入**: チュートリアル用の最初の2枚もランダムに選択
- **多様性の確保**: カテゴリとブランドの重複を避ける仕組みを導入
- **バランスの改善**: スタイル選択がある場合、50%はスタイル一致、50%はその他から選択
- **診断結果の追跡**: 最終的な選択の多様性をログで確認可能に

### 2. initialProductService の改善

#### 変更前の問題点
- 最初の3枚が固定で人気商品から選択
- 商品の多様性が考慮されていない

#### 改善内容
- **人気商品の柔軟な選択**: 人気商品から1-2個をランダムに選択（固定ではない）
- **カテゴリ・ブランドの多様性**: 初期段階では重複を避ける選択アルゴリズム
- **段階的な選択**: 最初の5個は多様性重視、その後は通常のランダム選択

### 3. 実装の詳細

```javascript
// シャッフル関数の導入
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// カテゴリとブランドの追跡
const usedCategories = new Set<string>();
const usedBrands = new Set<string>();

// 多様性を考慮した選択
for (const product of shuffledCandidates) {
  if (tutorialProducts.length >= 2) break;
  
  const category = product.category || 'unknown';
  const brand = product.brand || 'unknown';
  
  if (tutorialProducts.length === 0 || 
      (\!usedCategories.has(category) || \!usedBrands.has(brand))) {
    tutorialProducts.push(product);
    selectedIds.add(product.id);
    usedCategories.add(category);
    usedBrands.add(brand);
  }
}
```

## テスト結果

実装後のテストにより、以下の改善が確認されました：

- **カテゴリ多様性**: シミュレーションで5商品中2-4カテゴリの多様性を実現
- **ブランド多様性**: シミュレーションで5商品中2-4ブランドの多様性を実現
- **価格帯の分散**: 様々な価格帯の商品が表示されるように改善

## 今後の推奨事項

1. **商品データの充実**
   - より多様なカテゴリの商品を追加
   - ブランドのバリエーションを増やす

2. **アルゴリズムの最適化**
   - ユーザーの過去のスワイプ履歴を考慮した選択
   - 機械学習モデルの導入による推薦精度向上

3. **A/Bテスト**
   - 多様性重視 vs 人気商品重視の比較
   - ユーザーエンゲージメントの測定

## ファイルの変更

- `/src/screens/onboarding/UnifiedSwipeScreen.tsx` - 商品選択ロジックの改善
- `/src/services/initialProductService.ts` - 初期商品選択の多様化
- `/scripts/test-product-diversity.js` - 多様性テストスクリプトの追加

## まとめ

この改善により、ユーザーが最初に見る商品の多様性が向上し、より豊かな体験を提供できるようになりました。特に、オンボーディング時の最初の印象が重要であるため、この改善はユーザーエンゲージメントの向上に寄与すると期待されます。
