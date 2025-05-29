# Stilya プロジェクト最適化ガイド

## 削除済みファイル
以下のファイル・ディレクトリはクリーンアップスクリプトで削除されました：

### 1. ビルドキャッシュ（削除理由：ビルド時に自動生成される）
- `android/.gradle/` - Gradleビルドキャッシュ
- `android/build/` - Androidビルド生成物
- `ios/build/` - iOSビルド生成物
- `ios/Pods/` - CocoaPodsキャッシュ

### 2. Expo/Metroキャッシュ（削除理由：起動時に再生成される）
- `.expo/` - Expo設定キャッシュ
- `node_modules/.cache/` - 各種ツールのキャッシュ
- `.metro-health-check-result` - Metroバンドラーのヘルスチェック結果

### 3. 一時ファイル（削除理由：開発環境のゴミファイル）
- `*.log` - ログファイル
- `.DS_Store` - macOSのフォルダ設定
- `Thumbs.db` - Windowsのサムネイルキャッシュ
- `*.swp`, `*.swo` - Vimの一時ファイル

## 今後のメンテナンス推奨事項

### 1. .gitignoreの更新
以下を.gitignoreに追加して、不要ファイルがリポジトリに含まれないようにしてください：

```gitignore
# Android
android/.gradle/
android/build/
android/app/build/
*.apk
*.aab

# iOS
ios/build/
ios/Pods/
*.ipa
*.dSYM.zip
*.dSYM

# Metro
.metro-health-check-result
metro-cache/
.metro-cache/

# Expo
.expo/
dist/
web-build/

# TypeScript
*.tsbuildinfo
tsconfig.tsbuildinfo

# 一時ファイル
*.log
*.swp
*.swo
.DS_Store
Thumbs.db

# テスト関連
coverage/
.nyc_output/
```

### 2. package.jsonの最適化
不要な可能性があるdevDependencies：
- `fs-extra` - Node.js標準のfsモジュールで代替可能
- `autoprefixer` - NativeWindで必要だが、確認が必要

### 3. 定期的なクリーンアップ
プロジェクトのpackage.jsonに以下のスクリプトを追加済み：

```json
"clean": "rm -rf node_modules/.cache .expo .metro-cache",
"reset": "npm run clean && rm -rf node_modules && npm install"
```

使用方法：
- `npm run clean` - キャッシュのみクリア
- `npm run reset` - 完全リセット

### 4. ビルド前のチェックリスト
EASビルドを実行する前に：
1. `npm run clean` でキャッシュをクリア
2. `npm run lint` でコード品質チェック
3. `npm run type-check` で型エラーチェック

### 5. 開発環境の最適化
- Node.js 20.x以上を使用（.nvmrcに記載済み）
- npm 9.x以上を使用
- 定期的な`npm audit`で脆弱性チェック

## トラブルシューティング

### ビルドエラーが発生した場合
```bash
# 完全リセット
npm run reset

# Expoキャッシュクリア
npx expo start --clear

# iOS専用（Macのみ）
cd ios && pod deintegrate && pod install
```

### パフォーマンスが低下した場合
```bash
# Metroキャッシュのリセット
npx react-native start --reset-cache

# watchmanのリセット（インストール済みの場合）
watchman watch-del-all
```
