# Stilya - スタイル診断機能実装ガイド

## 概要
既存のオンボーディングフローにスタイル診断機能が実装されています。
新規ユーザーがログイン後、自動的にオンボーディングフローに誘導される仕組みが構築されました。

## 実装済み機能

### 1. オンボーディングフロー
- **Welcome** → **AppIntro** → **Gender** → **Style** → **StyleQuiz** → **AgeGroup** → **Complete**
- 各ステップで収集した情報はOnboardingContextで管理
- 完了後、ユーザープロファイルがSupabaseに保存

### 2. スタイル診断（StyleQuizScreen）
- 10枚の商品をスワイプしてYes/No判定
- ジェンダーとスタイル選好に基づいて商品を選定
- スワイプ結果はStyleQuizResultとして保存
- 診断結果に基づいて今後のレコメンドを最適化

### 3. 自動遷移ロジック（AppNavigator）
```typescript
// オンボーディング完了チェック
const isOnboardingComplete = React.useMemo(() => {
  if (!user) return false;
  const hasGender = user.gender !== undefined && user.gender !== null;
  const hasStylePreference = user.stylePreference && user.stylePreference.length > 0;
  const hasAgeGroup = user.ageGroup !== undefined && user.ageGroup !== null;
  return hasGender && hasStylePreference && hasAgeGroup;
}, [user]);
```

## The Yesから学んだベストプラクティス

### 1. シンプルで直感的な診断
- 3分程度で完了する短い診断
- ビジュアル中心のインターフェース
- スワイプUIで楽しく操作

### 2. 継続的な学習
- 初回診断は入口に過ぎない
- 日々の使用を通じて精度が向上
- ポップクイズでさらなる好みを収集

### 3. パーソナライズの可視化
- 診断結果をすぐに反映
- 「あなたのスタイル」を明確に表示
- 推薦理由を説明

## 今後の改善提案

### 1. 診断精度の向上
- 商品選定アルゴリズムの改善
- より多様なカテゴリから商品を選定
- スワイプ速度も考慮した分析

### 2. UI/UXの改善
- アニメーションの追加
- プログレス表示の改善
- スキップ時の警告メッセージ

### 3. 診断結果の活用
- スタイルレポートの生成
- 類似ユーザーとの比較
- スタイルの進化を可視化

## テスト方法

### 1. 新規ユーザーでテスト
```bash
# テストスクリプトを実行
node test-onboarding-flow.js
```

### 2. アプリでの確認
1. 新規アカウントを作成
2. ログイン後、自動的にオンボーディング開始
3. 各ステップを完了
4. スタイル診断でスワイプ
5. 完了後、メイン画面へ遷移

### 3. 既存ユーザーでテスト
- プロファイル未設定のユーザーでログイン
- 自動的にオンボーディングへ誘導されることを確認

## 実装ファイル

### コア機能
- `/src/navigation/AppNavigator.tsx` - オンボーディング判定ロジック
- `/src/screens/onboarding/StyleQuizScreen.tsx` - スタイル診断画面
- `/src/contexts/OnboardingContext.tsx` - オンボーディング状態管理
- `/src/screens/onboarding/CompleteScreen.tsx` - 完了画面

### ナビゲーション
- `/src/navigation/OnboardingNavigator.tsx` - オンボーディングフロー定義
- `/src/navigation/types.ts` - 型定義

### UI改善
- `/src/screens/onboarding/WelcomeScreen.tsx` - ウェルカム画面（スタイル修正済み）

## 注意事項

1. **既存ユーザーへの影響**
   - プロファイル未設定のユーザーは自動的にオンボーディングへ
   - 設定済みユーザーは通常通りメイン画面へ

2. **データの永続化**
   - 診断結果はSupabaseに保存
   - 中断しても進捗は保持されない（要改善）

3. **パフォーマンス**
   - 商品画像の読み込みを最適化
   - スワイプアニメーションの軽量化

## まとめ
The Yesのアプローチを参考に、シンプルで楽しいスタイル診断機能を実装しました。
継続的な改善により、よりパーソナライズされた体験を提供できるようになります。
