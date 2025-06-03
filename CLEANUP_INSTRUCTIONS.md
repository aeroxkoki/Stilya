# Stilya プロジェクト - クリーンアップ手順

## PlatformConstantsエラーの根本的解決

以下の手順を順番に実行してください：

### 1. プロセスの停止
```bash
# Expo開発サーバーを停止（Ctrl+Cまたは別ターミナルで）
pkill -f expo
pkill -f react-native
```

### 2. キャッシュとnode_modulesの完全削除
```bash
cd /Users/koki_air/Documents/GitHub/Stilya

# node_modulesと各種キャッシュを削除
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# watchmanキャッシュをクリア（インストールされている場合）
watchman watch-del-all 2>/dev/null || true

# npmキャッシュをクリア
npm cache clean --force
```

### 3. 依存関係の再インストール
```bash
# package-lock.jsonも削除して完全にクリーン
rm -f package-lock.json

# 依存関係を再インストール
npm install
```

### 4. Expo Goアプリの更新
1. シミュレータ/実機からExpo Goアプリを削除
2. App Store/Google Playから最新版のExpo Goを再インストール

### 5. 開発サーバーの起動
```bash
# キャッシュをクリアして起動
npx expo start --clear
```

### 6. 追加の対策（それでも解決しない場合）

#### Expo SDKの互換性を確認
```bash
npx expo-doctor
```

#### React Nativeのバージョンを確認
```bash
npm list react-native
```

#### 環境変数の確認
```bash
npm run check-env
```

## 重要な変更点

package.jsonで以下の変更を行いました：
- React Native: 0.75.0 → 0.74.5（Expo SDK 53と互換）
- Metro: 0.82.4 → 0.80.12（対応バージョンに調整）

## トラブルシューティング

### エラーが継続する場合

1. **Expo CLIのアップデート**
   ```bash
   npm install -g expo-cli@latest
   ```

2. **プロジェクトの prebuild（最終手段）**
   ```bash
   npx expo prebuild --clear
   ```

3. **開発用クライアントのビルド**
   ```bash
   eas build --platform ios --profile development
   ```

### 注意事項

- Managed Workflowを維持するため、`expo prebuild`は最終手段として使用
- EAS Buildを使用する場合は、開発用プロファイルを使用
- 本番ビルドの前に必ず動作確認を行う

## 問題が解決したら

1. 変更をコミット
   ```bash
   git add .
   git commit -m "fix: React Native version compatibility with Expo SDK 53"
   ```

2. GitHubにプッシュ
   ```bash
   git push origin develop
   ```
