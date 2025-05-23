# 🚨 プロビジョニングプロファイルエラーの解決

## エラーの原因
無料のApple Developer Account（Personal Team）では、実機でテストするためにデバイスの登録が必要です。

## 🎯 今すぐ解決する方法

### オプション1: シミュレーターで実行（推奨・5秒で解決）

```bash
# シミュレーターで起動
cd /Users/koki_air/Documents/GitHub/Stilya
npm run ios
```

または特定のシミュレーター：
```bash
npx expo run:ios --simulator "iPhone 15 Pro"
```

✅ **メリット**：
- デバイス登録不要
- すぐに実行可能
- 開発には十分

### オプション2: 実機を接続（10分）

1. **iPhoneをUSBで接続**
   - 純正ケーブル推奨
   - 「このコンピュータを信頼」をタップ

2. **Xcodeでデバイス確認**
   ```
   Xcode → Window → Devices and Simulators
   ```

3. **自動登録を待つ**
   - 初回は2-3分かかります

4. **再ビルド**
   - Xcodeで実機を選択して実行

### オプション3: Xcodeで直接実行

Xcodeの上部バーで：
1. デバイス選択を「iPhone 15 Pro」などのシミュレーターに変更
2. ▶️ ボタンでビルド

## 📱 ヘルパースクリプト

### シミュレーター実行ガイド
```bash
./run-simulator.sh
```

### 実機登録ガイド
```bash
./register-device.sh
```

## 💡 開発のヒント

**開発中**：シミュレーターで十分（99%のケース）
**最終テスト**：実機で確認（カメラ機能など）

---

**最速解決**：今すぐ `npm run ios` を実行してシミュレーターで開発を始めましょう！
