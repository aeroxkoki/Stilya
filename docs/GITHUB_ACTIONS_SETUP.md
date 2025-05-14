# GitHub Actions と Expo ビルド自動化

このリポジトリではGitHub Actionsを使用して、自動ビルドとテストを行っています。

## 必要な設定

GitHub Actionsでビルドを実行するには、以下のSecretsをリポジトリ設定に追加する必要があります：

1. `EXPO_TOKEN` - Expoアカウントのアクセストークン

## Expoトークンの取得方法

1. [Expo.dev](https://expo.dev) にログイン
2. 右上のプロフィールアイコンをクリック
3. 「Settings」→「Access Tokens」を選択
4. 「Create new token」をクリック
5. トークン名を入力（例：「GitHub Actions」）し、トークンを作成
6. 表示されたトークンをコピー（この画面を閉じると二度とトークンは表示されないため注意）

## GitHubにSecretsを追加する方法

1. GitHubリポジトリのページで「Settings」タブをクリック
2. 左側のメニューから「Secrets and variables」→「Actions」を選択
3. 「New repository secret」ボタンをクリック
4. 名前に「EXPO_TOKEN」と入力し、値にコピーしたExpoトークンを貼り付け
5. 「Add secret」をクリック

## ワークフローの動作

- `main`ブランチへのプッシュ: 本番環境向けのビルドが実行される（iOS/Android両方）
- `develop`ブランチへのプッシュ: プレビュー用のAndroidビルドが実行される
- プルリクエスト: ESLintとJestテストが実行される

## ビルド結果の確認

ビルドが完了すると、[Expo.dev](https://expo.dev)のダッシュボードでビルド結果を確認できます。
また、GitHub Actionsのワークフローページでもビルドのステータスやログを確認できます。
