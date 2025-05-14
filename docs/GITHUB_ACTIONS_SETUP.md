<!-- markdownlint-disable MD034 -->
# GitHub Actions と Expo EAS ビルド設定

このリポジトリではGitHub Actionsを使用して、自動ビルドとテストを行います。

## 1. 必要な設定

GitHub Actionsでビルドを実行するには、以下のSecretsをリポジトリ設定に追加する必要があります：

1. `EXPO_TOKEN` - Expoアカウントのアクセストークン

## 2. Expoトークンの取得方法

1. [Expo.dev](https://expo.dev) にログイン
2. 右上のプロフィールアイコンをクリック
3. 「Settings」→「Access Tokens」を選択
4. 「Create new token」をクリック
5. トークン名を入力（例：「GitHub Actions」）し、トークンを作成
6. 表示されたトークンをコピー（この画面を閉じると二度とトークンは表示されないため注意）

## 3. GitHubにSecretsを追加する方法

1. GitHubリポジトリのページで「Settings」タブをクリック
2. 左側のメニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンをクリック
4. 名前に「EXPO_TOKEN」と入力し、値にコピーしたExpoトークンを貼り付け
5. 「Add secret」をクリック

## 4. ワークフローの設定ファイル

このリポジトリでは `.github/workflows/expo-build.yml` ファイルでビルドのワークフローを定義しています。
主な内容は以下の通りです：

```yaml
name: Expo Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: 🏗 Setup repo
        uses: actions/checkout@v3

      - name: 🏗 Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: yarn

      - name: 🏗 Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: 📦 Install dependencies
        run: yarn install

      - name: 🧪 Run tests
        run: yarn test

      - name: 📝 Create EAS project if needed
        run: |
          # Check if project exists using eas whoami
          if ! npx eas whoami &>/dev/null; then
            echo "Logging in to EAS..."
            npx eas login --non-interactive
          fi
          
          # Initialize EAS project
          export EXPO_TOKEN=${{ secrets.EXPO_TOKEN }}
          npx eas project:link --non-interactive || echo "Project may already exist, continuing..."

      - name: 🚀 Build preview for develop branch
        if: github.ref == 'refs/heads/develop'
        run: npx eas build --platform android --profile preview --non-interactive --no-wait

      - name: 🚀 Build production for main branch
        if: github.ref == 'refs/heads/main'
        run: npx eas build --platform all --profile production --non-interactive --no-wait
```

## 5. ワークフローの動作

- `main`ブランチへのプッシュ: 本番環境向けのビルドが実行される（iOS/Android両方）
- `develop`ブランチへのプッシュ: プレビュー用のAndroidビルドが実行される
- プルリクエスト: テストが実行される

## 6. ビルド結果の確認

ビルドが完了すると、[Expo.dev](https://expo.dev)のダッシュボードでビルド結果を確認できます。
また、GitHub Actionsのワークフローページでもビルドのステータスやログを確認できます。

## 7. トラブルシューティング

### 7.1 `project:create` コマンドが見つからないエラー

EAS CLIの古いバージョンでは、プロジェクト作成のコマンドが異なる場合があります。
最新バージョンでは `eas project:link` コマンドを使用してください。

### 7.2 認証エラー

認証エラーが発生する場合、以下の手順で確認・解決してください：

1. EXPO_TOKENが正しく設定されているか確認
2. トークンの有効期限が切れていないか確認
3. 必要に応じて新しいトークンを生成

## 8. 参考リンク

- [Expo EAS Build ドキュメント](https://docs.expo.dev/build/introduction/)
- [GitHub Actions ドキュメント](https://docs.github.com/actions)
- [Expo GitHub Actions](https://github.com/expo/expo-github-action)
