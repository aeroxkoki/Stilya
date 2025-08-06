#!/bin/bash

# 相対パスを絶対パスに変換するスクリプト

echo "🔄 相対パスを@/パスエイリアスに変換中..."

# 対象ファイルリスト
files=(
    "src/screens/swipe/SwipeScreen.tsx"
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
    if [ -f "$file" ]; then
        echo "📝 処理中: $file"
        
        # sedコマンドで相対パスを絶対パスに置換
        # macOSの場合は -i '' を使用
        sed -i '' -E "s|from '\.\./(\.\./)+(types[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(contexts[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(hooks[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(components[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(services[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(utils[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(store[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(styles[^']*)'|from '@/\\3'|g" "$file"
        sed -i '' -E "s|from '\.\./(\.\./)+(navigation[^']*)'|from '@/\\3'|g" "$file"
    else
        echo "⚠️  ファイルが見つかりません: $file"
    fi
done

echo "✅ 変換完了！"
