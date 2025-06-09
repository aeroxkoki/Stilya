# EAS Build環境変数設定ガイド

本ドキュメントでは、Stilyaプロジェクトの環境変数を安全に管理し、EAS Buildで使用する方法を説明します。

## セキュリティ上の重要事項

**認証情報をGitHubにコミットしないでください！** 
- app.config.jsに認証情報をハードコードしない
- .envファイルは必ず.gitignoreに含める
- EAS Secretsを使用して本番環境の認証情報を管理する

## 環境変数の設定方法

### 1. ローカル開発環境

`.env`ファイルに以下の環境変数を設定：

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Affiliate APIs
LINKSHARE_API_TOKEN=your-token
LINKSHARE_MERCHANT_ID=your-merchant-id
RAKUTEN_APP_ID=your-app-id
RAKUTEN_AFFILIATE_ID=your-affiliate-id
RAKUTEN_APP_SECRET=your-app-secret
```

### 2. EAS Build環境（本番・プレビュー）

EAS Secretsを使用して環境変数を設定：

```bash
# Supabase設定
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://ddypgpljprljqrblpuli.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"

# 楽天API設定
eas secret:create --scope project --name RAKUTEN_APP_ID --value "your-app-id"
eas secret:create --scope project --name RAKUTEN_AFFILIATE_ID --value "your-affiliate-id"
eas secret:create --scope project --name RAKUTEN_APP_SECRET --value "your-app-secret"
```

### 3. 環境変数の確認

設定した環境変数を確認：

```bash
eas secret:list
```

### 4. 環境変数の更新

既存の環境変数を更新：

```bash
eas secret:update --scope project --name EXPO_PUBLIC_SUPABASE_URL
```

## app.config.jsの構成

`app.config.js`は動的設定を使用して環境変数を読み込みます：

```javascript
// 環境変数を読み込む
require('dotenv').config();

export default ({ config }) => {
  return {
    ...config,
    expo: {
      // ... その他の設定
      extra: {
        // 環境変数から読み込む（ハードコードしない）
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
        // ... その他の環境変数
      }
    }
  };
};
```

## ビルドプロファイル別の設定

### Development（開発ビルド）
- ローカルの.envファイルを使用
- `npm run start`でオンラインSupabase接続
- `npm run start:local`でローカルSupabase接続

### Preview（プレビュービルド）
- EAS Secretsから環境変数を取得
- 内部配布用のビルド

### Production（本番ビルド）
- EAS Secretsから環境変数を取得
- ストア配布用のビルド

## トラブルシューティング

### 環境変数が読み込まれない場合

1. EAS Secretsが正しく設定されているか確認：
   ```bash
   eas secret:list
   ```

2. ビルドキャッシュをクリア：
   ```bash
   eas build --clear-cache
   ```

3. app.config.jsで環境変数が正しく参照されているか確認

### ローカルとEASビルドで挙動が異なる場合

1. .envファイルとEAS Secretsの値が一致しているか確認
2. `expo.extra`フィールドで環境変数が正しく設定されているか確認

## セキュリティのベストプラクティス

1. **最小権限の原則**: 各環境に必要最小限の権限のみを付与
2. **定期的なキーローテーション**: APIキーを定期的に更新
3. **アクセスログの監視**: Supabaseダッシュボードでアクセスログを定期的に確認
4. **Row Level Security**: Supabaseでは必ずRLSを有効化

## 参考リンク

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Secrets](https://docs.expo.dev/build-reference/variables/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
