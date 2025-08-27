# オンボーディング画面からスワイプ画面への遷移問題 - 解決報告

## 問題概要
オンボーディング画面の完了後、スワイプ画面に遷移しない問題が発生していました。

## 根本原因
1. **ナビゲーション処理の不備**: `CompleteScreen`の`completeOnboarding()`メソッドがAsyncStorageの更新のみ行い、実際の画面遷移を行っていなかった
2. **ユーザー情報の更新不備**: AuthContextのユーザー情報（gender, stylePreference, ageGroup）が適切に更新されていなかった
3. **AppNavigatorの判定問題**: オンボーディング完了の判定がユーザー情報に依存していたが、その情報が更新されていなかった

## 実施した修正

### 1. CompleteScreen.tsx の修正
```typescript
// 修正前
const handleAutoNavigate = async () => {
  await completeOnboarding();
  // AppNavigatorが自動的にMain画面に遷移する（実際には遷移しない）
};

// 修正後
const handleAutoNavigate = async () => {
  await completeOnboarding();
  
  // ユーザー情報を確実に更新
  if (user) {
    await setUser({
      ...user,
      gender,
      stylePreference,
      ageGroup,
    });
  }
  
  // React NavigationのCommonActionsを使用して確実に遷移
  setTimeout(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' as any }],
      })
    );
  }, 100);
};
```

### 2. 必要なインポートの追加
- `CommonActions`を`@react-navigation/native`からインポート
- `useAuth`フックをインポートしてユーザー情報の更新機能を利用

### 3. エラーハンドリングの改善
エラーが発生した場合でも、強制的にMain画面に遷移するフォールバック処理を追加

## テスト手順

1. Expo Goでアプリを起動
```bash
./test-onboarding-fix.sh
```

2. 以下の手順でテスト
   - オンボーディング画面を最後まで進める
   - 「始める」ボタンをタップ
   - 3秒後に自動的にスワイプ画面に遷移することを確認
   - または「今すぐ始める」ボタンで即座に遷移

## 確認ポイント

✅ デバッグログに以下が表示されることを確認：
- `[CompleteScreen] 自動ナビゲーション開始`
- `[CompleteScreen] オンボーディング完了処理成功`
- `[CompleteScreen] Navigation reset to Main`
- `[SwipeScreen] Component mounted`

✅ スワイプ画面が正常に表示され、商品カードが操作できることを確認

## 今後の改善点

1. **状態管理の統一**: OnboardingContextとAuthContextの統合を検討
2. **型安全性の向上**: ナビゲーションの型定義を強化
3. **テストの追加**: E2Eテストを追加して遷移の確実性を保証

## ステータス
✅ **解決済み** - 2025年1月13日

## 関連ファイル
- `/src/screens/onboarding/CompleteScreen.tsx` - 修正済み
- `/src/navigation/AppNavigator.tsx` - 動作確認済み
- `/src/contexts/OnboardingContext.tsx` - 動作確認済み
- `/src/contexts/AuthContext.tsx` - 動作確認済み
