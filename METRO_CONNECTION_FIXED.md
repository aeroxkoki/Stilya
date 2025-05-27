# Metro Connection エラーの完全解決ガイド

## 解決した問題
iOS SimulatorがMetro bundlerに接続できないエラーを完全に解決しました。

## 実装した修正

### 1. グローバルexpo-cliからローカルExpo CLIへの移行
- すべてのnpmスクリプトを`expo`から`npx expo`に更新
- グローバルexpo-cliの非推奨化に対応

### 2. 修正スクリプトの作成
- `start-app.sh` - シンプルな起動スクリプト
- `enhanced-metro-fix.sh` - 包括的な修正スクリプト
- `quick-fix-metro.sh` - クイック修正スクリプト（更新済み）

### 3. ドキュメントの更新
- `IOS_DEVELOPER_QUICKSTART.md` - iOS開発者向けクイックガイド
- `IOS_SIMULATOR_CONNECTION_FIX.md` - 接続問題のトラブルシューティング

## 今すぐ使用する方法

### 最もシンプルな方法
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
./start-app.sh
```

### 問題が発生した場合
```bash
./enhanced-metro-fix.sh
```

## 主な変更点

### package.json
```json
// 変更前
"start": "expo start",

// 変更後
"start": "npx expo start",
```

### Info.plist
- NSAppTransportSecurityの設定を更新
- localhost/127.0.0.1への接続を許可

## 推奨事項

1. **グローバルexpo-cliの削除**
   ```bash
   npm uninstall -g expo-cli
   ```

2. **依存関係の更新**
   ```bash
   npx expo doctor --fix-dependencies
   ```

3. **定期的なキャッシュクリア**
   ```bash
   npm run clean
   ```

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm start` | Expoを起動 |
| `npm run start:ios` | iOS Simulatorで起動 |
| `./start-app.sh` | シンプルな起動スクリプト |
| `./enhanced-metro-fix.sh` | 包括的な修正スクリプト |

すべての変更はGitHubにプッシュ済みです。
