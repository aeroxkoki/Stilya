#\!/bin/bash

# 変更をステージング
git add babel.config.js package.json eas.json app.json metro.config.js src/contexts/AuthContext.tsx

# 変更をコミット
git commit -m "Fix: CI build issues with path aliases and module resolution"

# リモートリポジトリにプッシュ
git push origin main

echo "変更をGitHubにプッシュしました。ビルドエラーが解決されるはずです。"
