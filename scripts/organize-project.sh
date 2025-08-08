#!/bin/bash

# Stilya プロジェクト整理スクリプト
# 目的: プロジェクトディレクトリをクリーンアップし、MVP開発に最適化

echo "🧹 Stilya プロジェクトの整理を開始します..."

# 作業ディレクトリを確認
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. バックアップフォルダを作成（必要な場合）
echo "📦 バックアップフォルダを作成中..."
mkdir -p archive/scripts-backup-$(date +%Y%m%d)
mkdir -p archive/docs-backup-$(date +%Y%m%d)

# 2. 古いスクリプトをアーカイブ
echo "📁 古いスクリプトをアーカイブ中..."
# 重要なスクリプトは保持、それ以外はアーカイブ
ESSENTIAL_SCRIPTS=(
    "check-expo-go.sh"
    "organize-project.sh"
)

for script in scripts/*.sh scripts/*.js; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        should_keep=false
        
        for essential in "${ESSENTIAL_SCRIPTS[@]}"; do
            if [ "$filename" = "$essential" ]; then
                should_keep=true
                break
            fi
        done
        
        if [ "$should_keep" = false ]; then
            mv "$script" "archive/scripts-backup-$(date +%Y%m%d)/" 2>/dev/null
        fi
    fi
done

# 3. 不要なドキュメントをアーカイブ（最新の重要なもののみ保持）
echo "📚 ドキュメントを整理中..."
ESSENTIAL_DOCS=(
    "MVP_RELEASE_CHECKLIST.md"
    "DEVELOPMENT_GUIDELINES.md"
    "PRODUCTION_HANDOVER.md"
    "DATABASE_INITIALIZATION_GUIDE.md"
    "GITHUB_ACTIONS_SETUP.md"
    "PROJECT_ARCHITECTURE.md"
)

for doc in docs/*.md; do
    if [ -f "$doc" ]; then
        filename=$(basename "$doc")
        should_keep=false
        
        for essential in "${ESSENTIAL_DOCS[@]}"; do
            if [ "$filename" = "$essential" ]; then
                should_keep=true
                break
            fi
        done
        
        if [ "$should_keep" = false ]; then
            mv "$doc" "archive/docs-backup-$(date +%Y%m%d)/" 2>/dev/null
        fi
    fi
done

# 4. 一時ファイルとキャッシュをクリア
echo "🗑️ 一時ファイルを削除中..."
rm -rf .expo/
rm -rf .metro-health-check*
rm -rf .metro-cache/
rm -f *.log
rm -f *.tmp
rm -f *.temp
rm -f test-*.txt

# 5. iOS関連の不要ファイルをクリーンアップ（Managed Workflow維持）
if [ -d "ios" ]; then
    echo "📱 iOS関連ファイルをクリーンアップ中..."
    rm -rf ios/build/
    rm -rf ios/Pods/
    rm -rf ios/DerivedData/
    rm -f ios/Podfile.lock
fi

# 6. Android関連の不要ファイルをクリーンアップ
if [ -d "android" ]; then
    echo "🤖 Android関連ファイルをクリーンアップ中..."
    rm -rf android/app/build/
    rm -rf android/.gradle/
    rm -rf android/build/
fi

# 7. 重複ファイルを削除
echo "♻️ 重複ファイルを削除中..."
find . -name "*.backup" -type f -delete 2>/dev/null
find . -name "*.old" -type f -delete 2>/dev/null
find . -name "*.bak" -type f -delete 2>/dev/null
find . -name "*~" -type f -delete 2>/dev/null

# 8. scriptsディレクトリを再構成
echo "📂 scriptsディレクトリを再構成中..."
mkdir -p scripts/utils
mkdir -p scripts/maintenance
mkdir -p scripts/database
mkdir -p scripts/monitoring

# 残っているスクリプトを適切なフォルダに整理
for script in scripts/*.js scripts/*.ts; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        
        # スクリプト名に基づいて分類
        if [[ "$filename" == *"check"* ]] || [[ "$filename" == *"test"* ]] || [[ "$filename" == *"verify"* ]]; then
            mv "$script" scripts/utils/ 2>/dev/null
        elif [[ "$filename" == *"fix"* ]] || [[ "$filename" == *"cleanup"* ]] || [[ "$filename" == *"update"* ]]; then
            mv "$script" scripts/maintenance/ 2>/dev/null
        elif [[ "$filename" == *"database"* ]] || [[ "$filename" == *"db"* ]] || [[ "$filename" == *"supabase"* ]]; then
            mv "$script" scripts/database/ 2>/dev/null
        elif [[ "$filename" == *"monitor"* ]] || [[ "$filename" == *"analyze"* ]]; then
            mv "$script" scripts/monitoring/ 2>/dev/null
        fi
    fi
done

# 9. プロジェクトのサイズを確認
echo ""
echo "📊 プロジェクトサイズの確認:"
du -sh . 2>/dev/null
echo ""
echo "主要ディレクトリのサイズ:"
du -sh src/ 2>/dev/null
du -sh docs/ 2>/dev/null
du -sh scripts/ 2>/dev/null
du -sh archive/ 2>/dev/null

echo ""
echo "✅ プロジェクトの整理が完了しました！"
echo ""
echo "📝 次のステップ:"
echo "1. 'npm install' で依存関係を再インストール"
echo "2. 'npm run start:expo-go' でExpo Goテストを実行"
echo "3. GitHubにプッシュ"
