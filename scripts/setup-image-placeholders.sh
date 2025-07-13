#!/bin/bash

# Stilya 画像プレースホルダー実装スクリプト

echo "🎨 Stilya 画像プレースホルダー実装を開始します..."

# 1. expo-linear-gradient のインストール
echo "📦 必要なパッケージをインストール中..."
npx expo install expo-linear-gradient

# 2. プレースホルダーコンポーネントが正しく配置されているか確認
if [ -f "src/components/common/ImagePlaceholder.tsx" ]; then
    echo "✅ ImagePlaceholder.tsx が見つかりました"
else
    echo "❌ ImagePlaceholder.tsx が見つかりません"
    exit 1
fi

if [ -f "src/assets/images/placeholder-components.tsx" ]; then
    echo "✅ placeholder-components.tsx が見つかりました"
else
    echo "❌ placeholder-components.tsx が見つかりません"
    exit 1
fi

# 3. TypeScript の型チェック
echo "🔍 TypeScript の型チェックを実行中..."
npx tsc --noEmit

# 4. 成功メッセージ
echo "
✨ セットアップが完了しました！

使用方法:
1. スタイルプレースホルダー:
   import { StylePlaceholder } from '@/components/common/ImagePlaceholder';
   <StylePlaceholder styleName='casual' width={400} height={300} />

2. ロゴプレースホルダー:
   import { LogoPlaceholder } from '@/assets/images/placeholder-components';
   <LogoPlaceholder size={80} />

3. イラストプレースホルダー:
   import { WelcomeIllustrationPlaceholder } from '@/assets/images/placeholder-components';
   <WelcomeIllustrationPlaceholder width={600} height={400} />

詳細は docs/IMAGE_PLACEHOLDER_IMPLEMENTATION.md を参照してください。
"
