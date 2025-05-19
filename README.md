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

## GitHub Actions / CI環境での注意点

このプロジェクトではGitHub Actions環境でEASビルドを実行するための特別な設定が必要です。

### 1. Metro Bundlerへの依存を避ける

**重要: GitHub Actions上では、`expo start`や`expo export:embed`などMetro Bundlerに依存するコマンドは実行しないでください**

### 2. 正しい設定

```yaml
# 正しい設定例
- name: Install EAS CLI
  run: npm install -g eas-cli@latest

- name: Login to Expo
  run: eas login --token ${{ secrets.EXPO_TOKEN }}

- name: Run EAS Build
  run: |
    # ビルド時の環境変数を設定
    export EAS_NO_VCS=1
    export EAS_SKIP_JAVASCRIPT_BUNDLING=1
    
    # EAS Build を直接実行
    npx eas-cli@latest build \
      --platform android \
      --non-interactive \
      --profile ci \
      --local \
      --skip-workflow-check
```

### 3. 必要な設定ファイル

- `eas.json`: ビルドプロファイルの設定
- `metro.config.js`: Metro設定（CIではキャッシュを無効化）
- `.github/workflows/build.yml`: GitHub Actionsのワークフロー設定

## EAS Build設定

EASビルドを実行する前に、`EXPO_TOKEN`を設定してください。

```bash
# トークンの取得
eas login
eas token:create --name github-actions --non-interactive

# GitHubリポジトリにシークレットとして設定
# Settings > Secrets and Variables > Actions
# EXPO_TOKENという名前で追加
```

## トラブルシューティング

### よくあるエラー

1. **`EADDRINUSE: address already in use 127.0.0.1:8081`**
   - 原因: CI環境で`expo start`が実行されている
   - 解決: `expo start`をCI上で実行しない

2. **`Error: Cannot find module 'metro-config'`**
   - 原因: 依存関係に`metro-config`が含まれていない
   - 解決: `npm install metro-config --save-dev`

3. **`Error: Serializer did not return expected format`**
   - 原因: Metro Bundlerでシリアライズエラーが発生
   - 解決: EASビルドを直接使用し、ExpoのMetroへの依存を避ける

## ライセンス

[MIT](LICENSE)
