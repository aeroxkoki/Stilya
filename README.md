# Stilya - ファッション提案アプリ

![Build Status](https://github.com/aeroxkoki/Stilya/actions/workflows/build.yml/badge.svg)

## 概要

StiliyaはユーザーのファッションスタイルをAIで学習し、パーソナライズされたファッション提案を行うモバイルアプリです。スワイプUI（Yes/No）で好みを収集し、タグベースの推薦エンジンと（将来的に）画像特徴量によるベクトル検索を組み合わせた提案を行います。

## 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# Expoの起動
npm start
```

## プロジェクト構成

```
stilya/
├── src/              # ソースコード
├── assets/           # 画像・フォントなどのアセット
├── scripts/          # 開発・ビルド補助スクリプト
├── .github/          # GitHub Actions設定
├── app.json          # Expoアプリ設定
├── eas.json          # EASビルド設定
├── metro.config.js   # Metro Bundler設定
└── package.json      # 依存関係とスクリプト
```

## GitHub Actions CI/CD設定

このプロジェクトではGitHub Actionsを使用してCI/CDを自動化しています。

### ビルドワークフロー

`.github/workflows/build.yml`で定義されたワークフローは以下を実行します：

1. **テスト**: 単体テストの実行
2. **ビルド**: EASを使用したAndroidアプリのビルド

### CI環境での注意点

**重要: GitHub Actions環境ではMetro Bundlerへの依存を避けています**

```yaml
- name: Run EAS Build
  env:
    CI: true
    EAS_NO_VCS: 1
    EAS_BUILD: true
    EAS_SKIP_JAVASCRIPT_BUNDLING: 1
  run: npx eas-cli build --platform android --non-interactive --profile ci --local --skip-workflow-check
```

## EAS Build設定

ビルドを実行するには、GitHubリポジトリの「Settings > Secrets and Variables > Actions」にEXPO_TOKENを設定する必要があります：

```bash
# トークンの取得
eas login
eas token:create --name github-actions --non-interactive
```

## トラブルシューティング

### よくあるエラー

1. **Metro Bundlerの問題**
   - 原因: CI環境でMetro Bundlerが使用されている
   - 解決: `EAS_SKIP_JAVASCRIPT_BUNDLING=1`環境変数を設定

2. **依存関係の問題**
   - 原因: Metroのバージョン不整合
   - 解決: `npm run fix-metro`を実行

3. **シリアライズエラー**
   - 原因: `expo export:embed`のようなコマンドがCI環境で実行されている
   - 解決: 直接`eas build`コマンドを使用し、余計なスクリプトを経由しない

## ライセンス

[MIT](LICENSE)
