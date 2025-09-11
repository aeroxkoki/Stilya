# GitHub Actions ワークフロー

## アクティブなワークフロー

### 1. build.yml
- **目的**: Expo EASビルドの実行
- **トリガー**: 
  - mainブランチへのプッシュ
  - プルリクエスト
  - 手動実行
- **機能**: TypeScriptチェック、プレビューAPKビルド

### 2. daily-patch.yml
- **目的**: 日次メンテナンスパッチの実行
- **スケジュール**: 毎日午前2時（JST）
- **機能**: 
  - データベース統計の取得
  - 画像URLの最適化
  - 品質スコアの更新
  - 期限切れデータのクリーンアップ
  - 健全性チェック

## 必要なGitHub Secrets

以下のSecretsが必要です：

1. **SUPABASE_URL** - Supabase プロジェクトURL
2. **SUPABASE_ANON_KEY** - Supabase 匿名キー
3. **EXPO_TOKEN** - Expo アクセストークン（EASビルド用）

## メンテナンス

- Node.jsバージョン: 18（全ワークフローで統一）
- アクションバージョン: v4（最新）
- 依存関係インストール: `npm ci || npm install`（フォールバック処理）
