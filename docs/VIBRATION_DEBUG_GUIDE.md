# バイブレーション機能デバッグガイド

## 問題の概要
実機テストでスワイプ時のバイブレーションが機能していない問題を解決するためのガイドです。

## 実装状況

### 1. バイブレーション機能の実装場所
- ファイル: `src/components/swipe/SwipeCardImproved.tsx`
- ライブラリ: 
  - iOS: `expo-haptics` (Haptic Engine)
  - Android: `Vibration` API (React Native)

### 2. バイブレーションパターン
- **右スワイプ（いいね！）**: Heavy / ダブルタップパターン [0, 50, 30, 50]
- **左スワイプ（スキップ）**: Light / 短い振動 (30ms)
- **保存ボタン**: Medium / 中間振動 (40ms)

## デバッグ手順

### 1. 権限の確認

#### Android
- `app.config.js`に以下の権限が追加されているか確認:
```javascript
android: {
  permissions: [
    "CAMERA",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "VIBRATE"  // ← これが必要
  ]
}
```

#### iOS
- iOSではバイブレーション権限は不要（システム権限）
- ただし、デバイス設定でサイレントモードやバイブレーション設定を確認

### 2. ビルドの再作成
権限を追加した後は、開発ビルドを再作成する必要があります：

```bash
# 既存のビルドをクリア
npx expo prebuild --clear

# iOS（実機接続後）
npx expo run:ios --device

# Android（実機接続後）
npx expo run:android --device
```

### 3. デバッグログの確認
SwipeCardImproved.tsxに追加されたデバッグログを確認：

- `[SwipeCard] 右スワイプ検出 - バイブレーション開始`
- `[SwipeCard] iOS - Haptic Engineを使用`
- `[SwipeCard] Android - バイブレーションパターン: [0, 50, 30, 50]`
- エラーがある場合: `[SwipeCard] バイブレーションエラー:`

### 4. デバイス設定の確認

#### iOS
1. 設定 > サウンドと触覚
2. 「システムの触覚」がオンになっているか確認
3. サイレントモードが解除されているか確認

#### Android
1. 設定 > サウンドとバイブレーション
2. バイブレーションがオンになっているか確認
3. アプリごとの通知設定でバイブレーションが許可されているか確認

## トラブルシューティング

### 問題: バイブレーションが動作しない

1. **権限の問題**
   - app.config.jsにVIBRATE権限を追加
   - ビルドを再作成

2. **デバイス設定**
   - デバイスのバイブレーション設定を確認
   - 省電力モードが無効になっているか確認

3. **コードの問題**
   - デバッグログでエラーが出ていないか確認
   - Platform.OSが正しく判定されているか確認

4. **開発ビルドの問題**
   - Expo Goではなく開発ビルドを使用しているか確認
   - expo-dev-clientがインストールされているか確認

### 問題: iOSでHapticが動作しない

1. **デバイスの互換性**
   - iPhone 7以降でHaptic Engineがサポートされています
   - iPadではHapticはサポートされていません

2. **システム設定**
   - システムの触覚設定を確認

### 問題: Androidでパターンが正しく動作しない

1. **APIレベル**
   - Android 5.0 (API 21)以上が必要
   - 一部の古いデバイスではパターンがサポートされていない可能性

2. **デバイス固有の問題**
   - 一部のカスタムROMではバイブレーション動作が異なる可能性

## テスト方法

1. アプリを起動し、スワイプ画面を開く
2. 商品カードを右にスワイプ → 強いバイブレーション
3. 商品カードを左にスワイプ → 弱いバイブレーション
4. 「いいね！」ボタンをタップ → 強いバイブレーション
5. 「スキップ」ボタンをタップ → 弱いバイブレーション
6. 「保存」ボタンをタップ → 中間のバイブレーション

## 参考リンク

- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [React Native Vibration API](https://reactnative.dev/docs/vibration)
- [Android Vibration Permissions](https://developer.android.com/reference/android/Manifest.permission#VIBRATE)
