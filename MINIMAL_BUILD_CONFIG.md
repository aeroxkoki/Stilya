# Stilya MVP - 最小構成ガイド

## 🎯 目的
ビルドエラーを解消し、MVP機能に必要な最小限の構成でプロジェクトを再構築する。

## 📁 推奨ディレクトリ構成

```
Stilya/
├── .github/workflows/
│   └── build.yml            # GitHub Actions設定
├── assets/                  # アプリアイコン・スプラッシュ画像
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── src/
│   ├── app/                 # メインアプリケーションファイル
│   │   └── App.tsx
│   ├── components/          # UIコンポーネント
│   │   ├── common/          # 共通コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ProductCard.tsx
│   │   └── swipe/           # スワイプ関連
│   │       ├── SwipeCard.tsx
│   │       └── SwipeContainer.tsx
│   ├── lib/                 # 外部ライブラリ設定・ユーティリティ
│   │   ├── supabase.ts      # Supabase初期化
│   │   └── constants.ts     # 定数定義
│   └── types/               # TypeScript型定義
│       └── index.ts
├── App.tsx                  # エントリーポイント
├── app.config.js            # Expo設定
├── eas.json                 # EAS Build設定
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── babel.config.js          # Babel設定
├── .env.example             # 環境変数テンプレート
└── .gitignore               # Git除外設定
```

## 📦 最小限のpackage.json

```json
{
  "name": "stilya",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "clean": "rm -rf node_modules .expo",
    "reset": "npm run clean && npm install"
  },
  "dependencies": {
    "expo": "~53.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.75.0",
    "@react-navigation/native": "^6.1.14",
    "@react-navigation/native-stack": "^6.9.22",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "~4.14.0",
    "@supabase/supabase-js": "^2.39.3",
    "@react-native-async-storage/async-storage": "~2.1.0",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.3.0",
    "@types/react-native": "0.73.0",
    "typescript": "^5.3.0"
  },
  "private": true
}
```

## 🔧 必要最小限の環境変数 (.env)

```
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# アフィリエイトAPI（後で追加）
# EXPO_PUBLIC_LINKSHARE_API_TOKEN=
# EXPO_PUBLIC_RAKUTEN_APP_ID=
```

## 📝 .gitignore 追加推奨項目

```
# Expo
.expo/
expo-env.d.ts

# Native projects
ios/
android/

# Metro
.metro-health-check*

# Temporary
*.tmp
temp/
backup/
patches/

# Build artifacts
build/
dist/
*.apk
*.aab
*.ipa

# Environment
.env
.env.local
.env.*.local
```

## 🚀 再構築手順

### 1. 不要ファイルの削除
```bash
# バックアップ作成
cp -r /Users/koki_air/Documents/GitHub/Stilya /Users/koki_air/Documents/GitHub/Stilya_backup

# 不要ディレクトリの削除
rm -rf android ios
rm -rf src/batch src/store src/contexts
rm -rf src/screens/report src/navigation/ReportNavigator.tsx
rm -rf src/services/analyticsService.ts src/services/integratedRecommendationService.ts
rm -rf src/utils/performance src/utils/metro-*.js
```

### 2. MVP機能に絞った再構築
```bash
# パッケージの再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュクリア
npx expo start -c
```

### 3. 最小限のエントリーポイント作成

**App.tsx（簡略版）**
```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SwipeScreen from './src/screens/swipe/SwipeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Swipe" 
            component={SwipeScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

## ✅ チェックリスト

- [ ] 不要な依存関係を削除
- [ ] androidとiosフォルダを削除（managed workflow維持）
- [ ] MVP機能（スワイプ、商品表示、認証）に絞る
- [ ] 分析・レポート機能は一時削除
- [ ] パフォーマンス計測機能は削除
- [ ] キャッシュをクリア
- [ ] 環境変数を正しく設定

## 🎯 MVP機能の優先順位

1. **必須機能**
   - Supabase認証
   - スワイプUI
   - 商品表示
   - Yes/No記録

2. **次フェーズ**
   - 推薦ロジック
   - プロフィール管理
   - スタイル診断

3. **将来機能**
   - 詳細な分析
   - SNSシェア
   - 高度な推薦AI

## 🔨 トラブルシューティング

### ビルドエラーが継続する場合
```bash
# 完全リセット
rm -rf node_modules .expo ios android
npm cache clean --force
npm install
npx expo doctor
```

### メモリ不足エラー
```bash
# Node.jsのメモリ上限を増やす
export NODE_OPTIONS="--max-old-space-size=8192"
```

### Metro bundlerエラー
```bash
# Metro設定をリセット
rm -rf .metro-health-check*
npx expo start -c
```

## 📱 ローカルビルドテスト
```bash
# iOSシミュレーターで実行
npx expo run:ios

# Androidエミュレーターで実行
npx expo run:android
```

---

この最小構成により、MVP開発に集中でき、ビルドエラーを解消できるはずです。
