# Stilya 環境変数設定ガイド

## 概要
Stilyaアプリケーションを動作させるために必要な環境変数の設定方法を説明します。

## 必要な環境変数

### 1. Supabase設定
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Supabaseプロジェクトの作成手順
1. [https://supabase.com](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトダッシュボードから以下を取得：
   - **Project URL**: Settings > API > Project URL
   - **Anon Key**: Settings > API > Project API keys > anon public

### 2. アフィリエイトAPI設定

#### LinkShare（Rakuten Advertising）
```bash
LINKSHARE_API_TOKEN=your-linkshare-api-token
LINKSHARE_MERCHANT_ID=your-merchant-id
```

取得方法：
1. [Rakuten Advertising](https://rakutenadvertising.com/) に登録
2. API認証情報を取得

#### 楽天アフィリエイト
```bash
RAKUTEN_APP_ID=your-rakuten-app-id
RAKUTEN_AFFILIATE_ID=your-affiliate-id
```

取得方法：
1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/) に登録
2. アプリケーションIDを取得
3. [楽天アフィリエイト](https://affiliate.rakuten.co.jp/) に登録
4. アフィリエイトIDを取得

### 3. その他の設定
```bash
NODE_ENV=development
EAS_PROJECT_ID=beb25e0f-344b-4f2f-8b64-20614b9744a3  # 既に設定済み
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG_MODE=true
```

## .envファイルの作成

1. `.env.example`をコピーして`.env`を作成：
```bash
cp .env.example .env
```

2. `.env`ファイルを編集して実際の値を設定：
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Affiliate APIs
LINKSHARE_API_TOKEN=your-actual-linkshare-token
LINKSHARE_MERCHANT_ID=your-actual-merchant-id
RAKUTEN_APP_ID=your-actual-rakuten-app-id
RAKUTEN_AFFILIATE_ID=your-actual-affiliate-id

# App Environment
NODE_ENV=development
EAS_PROJECT_ID=beb25e0f-344b-4f2f-8b64-20614b9744a3

# Development Configuration  
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG_MODE=true
```

## 環境変数の確認

設定が正しく読み込まれているか確認：
```bash
npx expo start --clear
```

アプリ内で環境変数にアクセス：
```typescript
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
```

## セキュリティに関する注意

- `.env`ファイルは`.gitignore`に含まれており、Gitにコミットされません
- 本番環境では、EAS Secretsを使用して環境変数を管理します
- APIキーは絶対に公開リポジトリにコミットしないでください

## EAS Secretsの設定（本番用）

```bash
# Supabase
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "your-production-url"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-production-key"

# Affiliate APIs
eas secret:create --name LINKSHARE_API_TOKEN --value "your-token"
eas secret:create --name LINKSHARE_MERCHANT_ID --value "your-id"
eas secret:create --name RAKUTEN_APP_ID --value "your-app-id"
eas secret:create --name RAKUTEN_AFFILIATE_ID --value "your-affiliate-id"
```

## トラブルシューティング

### 環境変数が読み込まれない場合
1. キャッシュをクリア：
   ```bash
   npx expo start --clear
   ```

2. node_modulesを再インストール：
   ```bash
   rm -rf node_modules
   npm install
   ```

3. `.env`ファイルのパスと権限を確認

### Supabase接続エラー
- URLが正しいか確認（https://を含む）
- Anon Keyが正しいか確認
- Supabaseプロジェクトがアクティブか確認

## 参考リンク

- [Expo環境変数ドキュメント](https://docs.expo.dev/guides/environment-variables/)
- [Supabaseドキュメント](https://supabase.com/docs)
- [楽天ウェブサービス](https://webservice.rakuten.co.jp/)
- [Rakuten Advertising](https://rakutenadvertising.com/)
