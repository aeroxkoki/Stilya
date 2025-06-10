# 開発ビルド設定ガイド

## 概要

Stilyaプロジェクトは**開発ビルド**（Custom Development Build）を使用して実機テストを行います。
Expo Goは使用しません。

## 開発ビルドとExpo Goの違い

| 項目 | 開発ビルド | Expo Go |
|------|-----------|----------|
| **カスタムネイティブコード** | ✅ 可能 | ❌ 不可 |
| **expo-dev-client** | ✅ 必須 | ❌ 不要 |
| **ビルド** | 必要 | 不要 |
| **起動方法** | --dev-client フラグ | 通常起動 |
| **アプリ名** | Stilya | Expo Go |

## 使用しているパッケージ

```json
"expo-dev-client": "~5.1.8"  // 開発ビルド用パッケージ
```

## 開発ビルドの作成

### 1. 開発ビルドを作成（初回のみ）

```bash
# iOS/Android両方の開発ビルド
npm run eas-build-development

# iOSのみ
npx eas build --platform ios --profile development

# Androidのみ
npx eas build --platform android --profile development
```

### 2. ビルドをインストール

- **iOS**: EASダッシュボードからダウンロード → シミュレーター/実機にインストール
- **Android**: APKをダウンロード → `adb install` または直接インストール

## 開発サーバーの起動

### 開発ビルド用（推奨）

```bash
# 開発ビルド用サーバー起動
npm start

# キャッシュクリアして起動
npm run clear-cache
```

### Expo Go用（非推奨）

```bash
# Expo Go用（開発ビルドがない場合のみ）
npm run start:expo-go
```

## スクリプト一覧

| コマンド | 説明 | 用途 |
|---------|------|------|
| `npm start` | 開発ビルド用サーバー起動 | **通常使用** |
| `npm run clear-cache` | キャッシュクリアして開発ビルド起動 | エラー時 |
| `npm run start:expo-go` | Expo Go用サーバー起動 | 緊急時のみ |
| `npm run eas-build-development` | 開発ビルド作成 | 初回/更新時 |
| `npm run eas-build-preview` | プレビュービルド作成 | テスト配布 |

## トラブルシューティング

### "Expo Go"のエラーが表示される場合

開発ビルドではなくExpo Goで開いている可能性があります：

1. 実機にインストールされているアプリを確認
   - **Stilya**（開発ビルド）を使用 ✅
   - **Expo Go**を使用していない ❌

2. サーバー起動コマンドを確認
   ```bash
   # 正しい
   npm start  # --dev-clientフラグが自動的に付与される
   
   # 間違い
   expo start  # フラグなし
   ```

### ネットワークエラーの場合

開発ビルドでは、オンラインのSupabaseに直接接続します：

```env
EXPO_PUBLIC_SUPABASE_URL=https://ycsydubuirflfuyqfshg.supabase.co
```

localhostへの接続は行いません。

### 開発ビルドの更新が必要な場合

ネイティブ依存関係を変更した場合は、新しい開発ビルドが必要です：

```bash
# 1. 新しいビルドを作成
npm run eas-build-development

# 2. 古いアプリをアンインストール

# 3. 新しいビルドをインストール
```

## 注意事項

1. **開発ビルドは署名付き**
   - 同じ署名のビルドでないと上書きインストールできません
   - 異なるビルドをインストールする場合は、古いものをアンインストール

2. **環境変数の反映**
   - 開発サーバーの再起動で反映されます
   - ビルドの再作成は不要

3. **デバッグメニュー**
   - `EXPO_PUBLIC_DEBUG_MODE=true`で有効化
   - アプリ内の開発メニューからアクセス

## 開発フロー

1. **初回セットアップ**
   ```bash
   # 依存関係インストール
   npm install
   
   # 開発ビルド作成
   npm run eas-build-development
   
   # ビルドをインストール（EASダッシュボードから）
   ```

2. **日常の開発**
   ```bash
   # 開発サーバー起動
   npm start
   
   # 実機でStilyaアプリを開く（QRコード不要）
   ```

3. **エラー時**
   ```bash
   # キャッシュクリア
   npm run clear-cache
   
   # ネットワークデバッグ
   # アプリ内開発メニューから実行
   ```
