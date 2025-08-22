#!/bin/bash

echo "=== Stilya アプリ整合性チェック ==="
echo ""

# 1. TypeScript型チェック（OnboardingSwipeCard関連のみ）
echo "1. OnboardingSwipeCard関連の型チェック..."
echo "----------------------------------------"
npx tsc --noEmit 2>&1 | grep -E "(OnboardingSwipeCard|UnifiedSwipe)" || echo "✅ OnboardingSwipeCard関連にTypeScriptエラーなし"
echo ""

# 2. import/export チェック
echo "2. Import/Export整合性チェック..."
echo "----------------------------------------"

# OnboardingSwipeCardのexport確認
if grep -q "export default OnboardingSwipeCard" src/components/onboarding/OnboardingSwipeCard.tsx; then
    echo "✅ OnboardingSwipeCard: default exportあり"
else
    echo "❌ OnboardingSwipeCard: default exportなし"
fi

# UnifiedSwipeScreenでのimport確認
if grep -q "import OnboardingSwipeCard from '@/components/onboarding/OnboardingSwipeCard'" src/screens/onboarding/UnifiedSwipeScreen.tsx; then
    echo "✅ UnifiedSwipeScreen: 正しくimport"
else
    echo "❌ UnifiedSwipeScreen: importエラー"
fi
echo ""

# 3. 依存関係チェック
echo "3. 依存関係チェック..."
echo "----------------------------------------"

# 必要なimportの確認
echo "OnboardingSwipeCardの依存関係:"
grep "^import" src/components/onboarding/OnboardingSwipeCard.tsx | while read line; do
    echo "  - $line"
done
echo ""

# 4. Product型の使用確認
echo "4. Product型の使用確認..."
echo "----------------------------------------"
echo "OnboardingSwipeCardで使用されているProductプロパティ:"
grep -o "product\.[a-zA-Z]*" src/components/onboarding/OnboardingSwipeCard.tsx | sort | uniq | while read prop; do
    echo "  - $prop"
done
echo ""

# 5. スタイル整合性チェック
echo "5. スタイル整合性チェック..."
echo "----------------------------------------"
echo "OnboardingSwipeCardのスタイル定義:"
grep -c "const styles = StyleSheet.create" src/components/onboarding/OnboardingSwipeCard.tsx > /dev/null && echo "✅ StyleSheet定義あり" || echo "❌ StyleSheet定義なし"
echo ""

# 6. アニメーション関連チェック
echo "6. アニメーション関連チェック..."
echo "----------------------------------------"
echo "UnifiedSwipeScreenのアニメーション設定:"
grep -c "CardAnimationState" src/screens/onboarding/UnifiedSwipeScreen.tsx > /dev/null && echo "✅ CardAnimationState定義あり" || echo "❌ CardAnimationState定義なし"
grep -c "useSharedValue" src/screens/onboarding/UnifiedSwipeScreen.tsx > /dev/null && echo "✅ useSharedValue使用" || echo "❌ useSharedValue未使用"
grep -c "withTiming" src/screens/onboarding/UnifiedSwipeScreen.tsx > /dev/null && echo "✅ withTiming使用" || echo "❌ withTiming未使用"
echo ""

# 7. 定数チェック
echo "7. 定数の整合性チェック..."
echo "----------------------------------------"
echo "UnifiedSwipeScreenの主要定数:"
grep "^const SWIPE_" src/screens/onboarding/UnifiedSwipeScreen.tsx | while read line; do
    echo "  $line"
done
echo ""

# 8. 循環参照チェック
echo "8. 循環参照チェック..."
echo "----------------------------------------"
# OnboardingSwipeCardがUnifiedSwipeScreenをimportしていないか確認
if grep -q "UnifiedSwipeScreen" src/components/onboarding/OnboardingSwipeCard.tsx; then
    echo "⚠️  潜在的な循環参照の可能性"
else
    echo "✅ 循環参照なし"
fi
echo ""

echo "=== 整合性チェック完了 ==="
