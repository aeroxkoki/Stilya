#\!/bin/bash

echo "📝 変更をコミットしています..."
git add .
git commit -m "Fix: Resolve Expo and Autolinking configuration issues"

echo "🚀 GitHubにプッシュしています..."
git push origin main

echo "✅ 変更がリポジトリに反映されました。"
