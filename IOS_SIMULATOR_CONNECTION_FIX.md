# iOS Simulator Metro Connection Fix

## 問題の概要
iOS SimulatorがMetro bundlerに接続できず、以下のエラーが表示される：
```
Could not connect to development server.
URL: http://127.0.0.1:8081/node_modules/expo/AppEntry.bundle...
```

## 解決方法

### 方法1: クイックフィックス（推奨）
```bash
# 作成したスクリプトを実行
./quick-fix-metro.sh
```

このスクリプトは以下を自動的に実行します：
- 既存のMetro/Expoプロセスを停止
- キャッシュをクリア
- 最適化された設定でExpoを起動

### 方法2: 手動での修正

1. **既存のプロセスを停止**
```bash
pkill -f expo
pkill -f metro
```

2. **キャッシュをクリア**
```bash
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache
```

3. **Watchmanをリセット（インストール済みの場合）**
```bash
watchman watch-del-all
```

4. **Expoを再起動**
```bash
expo start --clear
```

### 方法3: 詳細な修正スクリプト
```bash
# より詳細な修正を行うスクリプト
./fix-metro-ios-connection.sh
```

## 実装した修正内容

### 1. Info.plist の更新
`ios/Stilya/Info.plist`のNSAppTransportSecurity設定を更新し、開発環境でのローカル接続を許可：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
        <key>127.0.0.1</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

### 2. Metro設定の最適化
`metro.config.js`は既に適切に設定されています。必要に応じて、デバッグ用の設定を使用できます。

## トラブルシューティング

### それでも接続できない場合

1. **ポート8081が使用されていないか確認**
```bash
lsof -i :8081
```

2. **Xcodeのコマンドラインツールを確認**
```bash
xcode-select --install
```

3. **シミュレーターをリセット**
- iOS Simulatorメニュー → Device → Erase All Content and Settings

4. **異なるポートで起動**
```bash
export RCT_METRO_PORT=8082
expo start --port 8082
```

### 推奨される開発フロー

1. プロジェクトディレクトリに移動
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
```

2. クイックフィックスを実行
```bash
./quick-fix-metro.sh
```

3. 新しいターミナルタブでシミュレーターを起動
```bash
npm run start:ios
```

## 今後の推奨事項

1. **定期的なキャッシュクリア**
   - 開発中に問題が発生した場合は、`npm run clean`を実行

2. **Expo SDKの更新**
   - 推奨されるパッケージバージョンへの更新を検討

3. **ネイティブビルドの検討**
   - 継続的な問題がある場合は、EAS Buildを使用したネイティブビルドを検討

## 関連ドキュメント
- [Expo Troubleshooting Guide](https://docs.expo.dev/workflow/debugging/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Metro Configuration](https://metrobundler.dev/docs/configuration)
