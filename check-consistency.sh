#!/bin/bash

echo "🔍 プロジェクト整合性チェックスクリプト"
echo "========================================"
echo ""

# 1. インポートパターンの統計
echo "📊 1. インポートパターンの統計"
echo "--------------------------------"
echo ""
echo "- @/形式の使用箇所:"
@_slash_count=$(grep -r "from '@/" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  $@_slash_count 箇所"
echo ""
echo "- 相対パス '../' の使用箇所:"
relative_count=$(grep -r "from '\\.\\." src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  $relative_count 箇所"
echo ""
echo "- 相対パス './' の使用箇所:"
dot_slash_count=$(grep -r "from '\\./" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "  $dot_slash_count 箇所"
echo ""

# 2. 設定ファイルの確認
echo "✅ 2. 設定ファイルの確認"
echo "------------------------"
echo ""

# babel.config.js
echo "📋 babel.config.js のエイリアス:"
echo "  @/形式のサポート:"
if grep -q "@/components" babel.config.js; then
    echo "  ✓ @/形式がサポートされています"
else
    echo "  ✗ @/形式がサポートされていません"
fi
echo ""

# metro.config.js
echo "📋 metro.config.js のエイリアス:"
echo "  @/形式のサポート:"
if grep -q "@/components" metro.config.js; then
    echo "  ✓ @/形式がサポートされています"
else
    echo "  ✗ @/形式がサポートされていません"
fi
echo ""

# tsconfig.json
echo "📋 tsconfig.json のパス設定:"
echo "  @/*形式のサポート:"
if grep -q '"@/\*"' tsconfig.json; then
    echo "  ✓ @/*形式がサポートされています"
else
    echo "  ✗ @/*形式がサポートされていません"
fi
echo ""

# 3. 依存関係の確認
echo "📦 3. 重要な依存関係の確認"
echo "--------------------------"
echo ""
echo "React Native Reanimated:"
npm list react-native-reanimated 2>/dev/null | head -2
echo ""
echo "Module Resolver:"
npm list babel-plugin-module-resolver 2>/dev/null | head -2
echo ""

# 4. 推奨事項
echo "💡 4. 推奨事項"
echo "--------------"
echo ""

if [ "$relative_count" -gt 0 ]; then
    echo "⚠️  相対パス '../' が $relative_count 箇所で使用されています"
    echo "   推奨: @/形式に統一することを推奨します"
    echo ""
    echo "   例: '../utils/env' → '@/utils/env'"
    echo ""
fi

if [ "$dot_slash_count" -gt 0 ]; then
    echo "⚠️  相対パス './' が $dot_slash_count 箇所で使用されています"
    echo "   推奨: 同一ディレクトリ内のファイルを参照する場合のみ使用"
    echo ""
fi

# 5. エラーチェック
echo "🔴 5. 潜在的な問題の検出"
echo "------------------------"
echo ""

# react-native-reanimatedのインポート確認
echo "React Native Reanimated の初期化:"
if grep -q "import 'react-native-reanimated'" App.tsx; then
    echo "  ✓ App.tsxで正しく初期化されています"
else
    echo "  ✗ App.tsxでの初期化が見つかりません"
fi
echo ""

# babel pluginの順序確認
echo "Babel Plugin の順序:"
if tail -n 5 babel.config.js | grep -q "react-native-reanimated/plugin"; then
    echo "  ✓ react-native-reanimated/pluginが最後に配置されています"
else
    echo "  ✗ react-native-reanimated/pluginが最後に配置されていません"
fi
echo ""

# 6. サマリー
echo "📝 6. サマリー"
echo "-------------"
echo ""
echo "整合性チェック結果:"
echo ""

total_imports=$((${@_slash_count} + ${relative_count} + ${dot_slash_count}))
@_percent=$((${@_slash_count} * 100 / ${total_imports}))

echo "- 総インポート数: $total_imports"
echo "- @/形式の使用率: ${@_percent}%"
echo ""

if [ "${@_percent}" -gt 80 ]; then
    echo "✅ インポートパターンは概ね統一されています"
else
    echo "⚠️  インポートパターンの統一を検討してください"
fi

echo ""
echo "========================================"
echo "チェック完了"
echo ""
