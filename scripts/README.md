# Scripts ディレクトリ構成

このディレクトリには、Stilyaプロジェクトの開発・運用に必要な各種スクリプトが整理されています。

## 📁 アクティブなディレクトリ

### maintenance/
日次メンテナンスとクリーンアップスクリプト
- `simple-daily-patch.js` - 日次メンテナンスパッチ（GitHub Actionsで使用）
- `smart-cleanup.js` - スマートクリーンアップ機能
- `deletion-policies.json` - 削除ポリシー設定
- `setup-dev-env.sh` - 開発環境セットアップ
- `reset-dev-env.sh` - 開発環境リセット

### monitoring/
システム監視スクリプト
- `check-capacity.js` - データベース容量チェック
- `evaluate-daily-patch.js` - 日次パッチの評価
- `github-actions-monitor.js` - GitHub Actions監視
- `supabase-free-tier-monitor.js` - Supabase無料枠監視

### sync/
データ同期関連（最小構成）
- `providers/` - APIプロバイダー実装
  - `base-provider.js` - ベースプロバイダー
  - `rakuten-provider.js` - 楽天API
  - `valuecommerce-provider.js` - ValueCommerce API
- `duplicate-prevention-helper.js` - 重複防止
- `enhanced-tag-extractor.js` - タグ抽出

### database/
データベース関連のSQLとスクリプト
- 各種マイグレーションファイル
- スキーマ定義
- データベース管理ツール

### utils/
ユーティリティスクリプト
- 環境検証
- タイプ生成
- その他ツール

### build/
ビルド関連（将来使用予定）

## 🚀 よく使うコマンド

```bash
# 日次パッチの実行
npm run daily-patch

# データベース容量チェック
npm run monitor:capacity

# GitHub Actions監視
npm run monitor:github

# スマートクリーンアップ（ドライラン）
npm run cleanup:dry-run
```

## 📦 アーカイブされたファイル

不要・重複・一時的なファイルは`archived/`ディレクトリに移動されました：

- `test-*.js`, `test-*.ts` - テストファイル
- `debug-*.js`, `diagnose-*.js` - デバッグ・診断ファイル
- `fix-*.js`, `fix-*.ts` - 一時的な修正スクリプト
- `check-*.js`, `check-*.ts` - チェックスクリプト
- `analyze-*.js` - 分析スクリプト
- 古い同期スクリプト（sync-*.js等）
- テスト関連ディレクトリ（testing/, test/）

## 📝 注意事項

- 本番環境で実行する前に、必ずスクリプトの内容を確認してください
- 環境変数（.env）が正しく設定されていることを確認してください
- データベース変更を伴うスクリプトは、事前にバックアップを取ることを推奨します
- アーカイブされたファイルは将来の参照用に保持されています
