# 画像プレースホルダー実装ガイド

## 概要
Stilyaプロジェクトでは、本番用の画像アセットが準備されるまでの間、React Nativeコンポーネントベースのプレースホルダーを使用できます。

## 必要なパッケージ

### 1. expo-linear-gradient のインストール
グラデーション効果のために必要です：

```bash
npx expo install expo-linear-gradient
```

### 2. @expo/vector-icons の確認
すでにインストール済みですが、念のため確認：

```bash
npm list @expo/vector-icons
```

## 使用方法

### 1. スタイル画像のプレースホルダー

```tsx
import { StylePlaceholder } from '@/components/common/ImagePlaceholder';

// StyleScreen.tsx での使用例
<StylePlaceholder 
  styleName="casual" 
  width={400} 
  height={300} 
/>
```

### 2. ロゴのプレースホルダー

```tsx
import { LogoPlaceholder } from '@/assets/images/placeholder-components';

// WelcomeScreen.tsx での使用例
<LogoPlaceholder size={80} />
```

### 3. イラストのプレースホルダー

```tsx
import { WelcomeIllustrationPlaceholder } from '@/assets/images/placeholder-components';

// WelcomeScreen.tsx での使用例
<WelcomeIllustrationPlaceholder 
  width={width * 0.8} 
  height={height * 0.3} 
/>
```

## 実装済みのスタイル

- **casual** - カジュアル（オレンジ系グラデーション、Tシャツアイコン）
- **street** - ストリート（赤系グラデーション、スケートボードアイコン）
- **mode** - モード（グレー系グラデーション、ダイヤモンドアイコン）
- **natural** - ナチュラル（緑系グラデーション、葉っぱアイコン）
- **classic** - クラシック（紫系グラデーション、ビジネスアイコン）
- **feminine** - フェミニン（ピンク系グラデーション、花アイコン）

## 本番画像への移行

1. デザイナーから画像を受け取る
2. 各画像を適切なサイズに最適化（推奨ツール: ImageOptim, TinyPNG）
3. `src/assets/` ディレクトリの対応するファイルを置き換える
4. プレースホルダーコンポーネントの使用箇所を実際の画像に置き換える

```tsx
// Before (プレースホルダー)
<StylePlaceholder styleName="casual" width={400} height={300} />

// After (実際の画像)
<Image 
  source={require('@/assets/style-casual.png')} 
  style={styles.image}
  resizeMode="cover"
/>
```

## 利点

- **即座に開発可能** - 画像の準備を待たずに開発を進められる
- **視覚的にわかりやすい** - 各スタイルの特徴を色とアイコンで表現
- **パフォーマンス** - 画像ファイルより軽量
- **カスタマイズ可能** - サイズや色を簡単に調整

## 注意事項

- プレースホルダーはあくまで開発用です
- 本番リリース前には必ず実際の画像に置き換えてください
- `expo-linear-gradient` パッケージのインストールを忘れずに
