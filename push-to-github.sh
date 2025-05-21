#\!/bin/bash
# push-to-github.sh
# GitHub リポジトリに変更をプッシュするスクリプト

set -e

echo "📤 変更をGitHubリポジトリにプッシュします..."

# 現在のブランチ名を取得
CURRENT_BRANCH=$(git branch --show-current)

# 変更をステージング
git add .github/workflows/build.yml
git add eas.json
git add metro.config.js
git add babel.config.js
git add scripts/ci-build-fix.sh

# コミットメッセージを設定
COMMIT_MESSAGE="fix: GitHub Actions & Expo SDK 53 互換性の問題を解決

- GitHub Actions ワークフローを最新のベストプラクティスに更新
- EAS設定ファイルを更新し、CLIバージョン要件を修正
- Metro設定を最適化してシリアライザの問題を解消
- CI環境用の依存関係固定化スクリプトを追加"

# 変更をコミット
git commit -m "${COMMIT_MESSAGE}"

# 変更をプッシュ
git push origin ${CURRENT_BRANCH}

echo "✅ 変更を ${CURRENT_BRANCH} ブランチにプッシュしました！"
