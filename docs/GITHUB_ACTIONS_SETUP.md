# GitHub Actions設定ガイド

このガイドでは、GitHub Actionsを使用したStilya（スワイプ型ファッション提案アプリ）のビルドおよび商品同期ワークフローについて説明します。

## 概要

Stilyaでは以下の2つのGitHub Actionsワークフローを使用しています：

1. **EAS Build** - アプリのビルドを行うワークフロー
2. **Product Sync** - 商品データの同期を行うワークフロー

## 🔑 必要なGitHub Secrets

以下の変数をGitHubリポジトリのSecretsに設定してください：

| Secret名 | 説明 | 
|----------|------|
| `EXPO_TOKEN` | Expoアカウントのアクセストークン |
| `SUPABASE_URL` | SupabaseプロジェクトのURL |
| `SUPABASE_ANON_KEY` | Supabase匿名キー | 
| `RAKUTEN_APP_ID` | 楽天アプリケーションID |
| `RAKUTEN_AFFILIATE_ID` | 楽天アフィリエイトID |

## EAS Build ワークフロー

このワークフローは、アプリのビルドを自動化します。

### 特徴
- mainブランチへのプッシュ時に本番ビルドを自動実行
- developブランチへのプッシュ時にプレビュービルドを自動実行
- 手動でのビルド実行も可能（プラットフォームとプロファイルを選択可能）

### 実行方法
1. **自動実行**: `main`または`develop`ブランチへのプッシュ時に自動実行
2. **手動実行**:
   - GitHubリポジトリの **Actions** タブを開く
   - 左側から「EAS Build」を選択
   - 右側の「Run workflow」ボタンをクリック
   - プラットフォーム（iOS/Android/両方）とプロファイル（development/preview/production）を選択
   - 「Run workflow」を再度クリックして実行

## Product Sync ワークフロー

このワークフローは、アプリで使用する商品データをアフィリエイトAPIから取得し、Supabaseに同期します。

### 特徴
- 毎日定期実行（JST午前2時と午後2時）
- 商品データの取得と保存
- Supabase DBの容量監視と自動最適化
- 複数の同期モード（full/mvp/extended/seasonal）
- 詳細なカスタマイズオプション

### 実行方法
1. **自動実行**: 設定されたスケジュールで自動実行（JST午前2時と午後2時）
2. **手動実行**:
   - GitHubリポジトリの **Actions** タブを開く
   - 左側から「Product Sync」を選択
   - 右側の「Run workflow」ボタンをクリック
   - 必要に応じてオプションを設定（同期モード、フィルター、ブランド指定など）
   - 「Run workflow」を再度クリックして実行

### 同期モード
- **full**: 全商品（50-60ブランド）を同期
- **extended**: 拡張MVP（30ブランド）を同期
- **mvp**: 主要ブランド（5ブランド）のみ同期
- **seasonal**: 季節商品を優先して同期
- **test**: テストモード（実際の変更はなし）

## 🚨 トラブルシューティング

### ビルドエラー
1. **EXPO_TOKEN**: Expoアカウントの有効なトークンが設定されているか確認
2. **依存関係エラー**: package.jsonの依存関係を確認

### 同期エラー
1. **Supabase接続エラー**: SUPABASE_URL, SUPABASE_ANON_KEYの設定を確認
2. **楽天APIエラー**: RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_IDの設定を確認
3. **レート制限エラー**: 「429 Too Many Requests」の場合、一定時間後に自動でリトライ

## メンテナンス

ワークフローファイルは以下の場所にあります：
- **EAS Build**: `.github/workflows/build.yml`
- **Product Sync**: `.github/workflows/product-sync.yml`

古いワークフローファイルは `.github/workflows/archive/` に保存されています。

---

**注意**: GitHub Secretsの設定は、リポジトリの「Settings」→「Secrets and variables」→「Actions」から行えます。
