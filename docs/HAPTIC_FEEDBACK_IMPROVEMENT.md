# Haptic Feedback Improvement Guide

## 概要
Stilyaアプリのスワイプ機能において、より良いユーザー体験を提供するためにバイブレーション（触覚フィードバック）を最適化しました。

## 実装内容

### 使用技術
- `expo-haptics`: iOS用のHaptic Engine API
- `Vibration`: Android用の標準バイブレーションAPI

### バイブレーションパターン

#### 1. 右スワイプ（いいね！）
- **iOS**: `Haptics.ImpactFeedbackStyle.Heavy` - 重めのインパクト
- **Android**: `[0, 50, 30, 50]` - ダブルタップパターン（50ms振動 → 30ms休止 → 50ms振動）
- **理由**: ポジティブなアクションなので、しっかりとしたフィードバックを提供

#### 2. 左スワイプ（スキップ）
- **iOS**: `Haptics.ImpactFeedbackStyle.Light` - 軽めのインパクト
- **Android**: 30ms単一振動
- **理由**: ネガティブなアクションなので、軽めのフィードバックで十分

#### 3. 保存ボタン
- **iOS**: `Haptics.ImpactFeedbackStyle.Medium` - 中間のインパクト
- **Android**: 40ms単一振動
- **理由**: 中間的なアクションとして、適度なフィードバックを提供

## 改善前後の比較

### Before
- すべてのアクションで`Vibration.vibrate(10)`（10ミリ秒）
- 短すぎて感じにくい
- アクションの違いが判別できない

### After
- アクション別に最適化されたパターン
- プラットフォーム別の最適化
- より明確で心地よいフィードバック

## 実装箇所
- `/src/components/swipe/SwipeCardImproved.tsx`
  - `onPanResponderRelease`: ジェスチャーでのスワイプ時
  - `handleProgrammaticSwipe`: ボタンでのスワイプ時
  - `animateButton`: 保存ボタン押下時

## ベストプラクティス

1. **Transient（短い振動）を使用**
   - 長すぎる振動は煩わしい
   - 50-100ms程度が理想的

2. **アクションに応じた差別化**
   - ポジティブ: 強め/ダブルタップ
   - ネガティブ: 軽め/シンプル
   - 中間: 中程度

3. **プラットフォーム別最適化**
   - iOS: Haptic Engineの活用
   - Android: カスタムパターンの実装

4. **視覚的フィードバックとの同期**
   - アニメーションと同時に発生
   - 遅延なく即座に反応

## 今後の改善案

1. **ユーザー設定の追加**
   - バイブレーションの強度調整
   - ON/OFF切り替え

2. **追加のフィードバックポイント**
   - カード読み込み完了時
   - エラー発生時
   - 成功メッセージ表示時

3. **A/Bテスト**
   - 異なるパターンの効果測定
   - ユーザー満足度の検証

## 参考資料
- [Apple Human Interface Guidelines - Haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptic-feedback)
- [Android Haptic Feedback Best Practices](https://developer.android.com/develop/ui/views/haptics)
- [2025 Guide to Haptics: Enhancing Mobile UX](https://medium.com/2025-guide-to-haptics)
