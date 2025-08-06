#!/bin/bash

# 相対パスを絶対パスに変換するスクリプト

echo "🔄 相対パスを@/パスエイリアスに変換中..."

# 変換関数
convert_imports() {
    local file=$1
    if [ -f "$file" ]; then
        echo "📝 処理中: $file"
        
        # 一時ファイルを作成
        cp "$file" "$file.bak"
        
        # Pythonを使用して複雑な正規表現処理
        python3 -c "
import re
import sys

with open('$file', 'r') from as f:
    content = f.read()

# 相対パスを@/パスに変換
patterns = [
    (r\"from '\\.\\./(\\.\\./)*(types)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(contexts)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(hooks)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(components)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(services)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(utils)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(store)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(styles)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r\"from '\\.\\./(\\.\\./)*(navigation)([^']*?)'\", r\"from '@/\\2\\3'\"),
    (r'from \"\\.\\./(\\.\\./)*(types)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(contexts)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(hooks)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(components)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(services)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(utils)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(store)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(styles)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
    (r'from \"\\.\\./(\\.\\./)*(navigation)([^\"]*?)\"', r'from \"@/\\2\\3\"'),
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content)

with open('$file', 'w') as f:
    f.write(content)

print(f'✅ {file} の変換完了')
"
        
        # バックアップファイルを削除
        rm -f "$file.bak"
    else
        echo "⚠️  ファイルが見つかりません: $file"
    fi
}

# 対象ファイルリスト（SwipeScreen.tsxは除外）
files=(
    "src/components/swipe/SwipeCardEnhanced.tsx"
    "src/components/swipe/StyledSwipeContainer.tsx"
    "src/components/swipe/StyledSwipeCard.tsx"
    "src/components/onboarding/StyleSelectionCard.tsx"
    "src/screens/onboarding/StyleSelectionScreen.tsx"
    "src/components/swipe/SwipeCard.tsx"
    "src/screens/onboarding/OnboardingScreen.tsx"
    "src/screens/auth/AuthScreen.tsx"
    "src/components/dev/DevMenu.tsx"
    "src/components/swipe/QuickViewModal.tsx"
    "src/screens/report/ReportScreen.tsx"
    "src/components/swipe/ActionButtons.tsx"
    "src/components/recommend/StyleTypeDisplay.tsx"
    "src/components/recommend/StyleTips.tsx"
    "src/components/recommend/RecommendReason.tsx"
    "src/components/recommend/PreferenceTrendsGraph.tsx"
    "src/components/common/ProductCard.tsx"
    "src/components/common/Loading.tsx"
    "src/components/common/Input.tsx"
    "src/components/common/Card.tsx"
    "src/components/common/Button.tsx"
)

# 各ファイルを処理
for file in "${files[@]}"; do
    convert_imports "$file"
done

echo "✅ すべての変換が完了しました！"
