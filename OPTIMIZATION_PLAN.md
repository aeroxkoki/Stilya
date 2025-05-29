# Stilya プロジェクト最適化計画

## 現状分析

### ファイル数とサイズ
- 総ファイル数: 40,883ファイル
- 総サイズ: 532MB
- node_modules: 489MB (約40,000ファイル)
- プロジェクトファイル（node_modules除く）: 219ファイル

### 主な問題点
1. **React Native バージョンの不整合**: React Native 0.76.0はExpo SDK 53と互換性がない
2. **過剰な依存関係**: MVPに不要なパッケージが含まれている
3. **重複したコンポーネント**: 同じ目的のコンポーネントが複数存在
4. **不要なスクリーン**: MVP段階で不要な開発用画面が含まれている

## 最適化手順

### Phase 1: 不要なファイルの削除

#### 削除対象ディレクトリ/ファイル:
1. **開発用スクリーン**
   - `src/screens/dev/` - 開発用テスト画面（MVP不要）
   - `src/navigation/DevNavigator.tsx`
   - `src/screens/onboarding/__mocks__/` - モックファイル

2. **重複コンポーネント**
   - `src/components/product/ProductCard.tsx` - common/ProductCard.tsxと重複
   - `src/components/test/` - テスト用コンポーネント

3. **未使用サービス**
   - `src/services/demoService.ts` - デモ用サービス
   - `src/services/viewHistoryService.ts` - MVP段階では不要

4. **その他**
   - `docs/` - ドキュメントディレクトリ（GitHubで管理）
   - `scripts/` - 各種スクリプト（必要なものは統合）
   - `supabase/` - Supabaseローカル開発用（MVP不要）

### Phase 2: 依存関係の最適化

#### 削除する依存関係:
- `expo-notifications` - MVP段階では不要
- `expo-localization` - MVP段階では不要
- `expo-updates` - MVP段階では不要
- `@react-navigation/stack` - native-stackで十分
- `fs-extra` - ビルド時のみ使用（devDependenciesに移動済み）

#### バージョン調整:
- `react-native`: 0.76.0 → 0.75.0 (Expo SDK 53互換)

### Phase 3: コード統合と簡素化

1. **コンポーネントの統合**
   - ProductCard系を1つに統合
   - Navigation系を簡素化

2. **サービスの統合**
   - recommendationService系を1つに統合
   - 不要なサービスを削除

3. **スタイルの最適化**
   - 未使用のスタイルファイルを削除
   - NativeWindの設定を最適化

### 目標達成基準
- node_modules以外のファイル数: 150ファイル以下
- プロジェクト総サイズ: 100MB以下（node_modules除く）
- ビルド成功: `npx expo run:ios`が正常に動作

## 実行コマンド

```bash
# Phase 1: クリーンアップ
npm run clean
rm -rf node_modules package-lock.json

# Phase 2: 不要ファイル削除
rm -rf docs/ scripts/ supabase/
rm -rf src/screens/dev/
rm -rf src/navigation/DevNavigator.tsx
rm -rf src/screens/onboarding/__mocks__/
rm -rf src/components/test/
rm -rf src/components/product/
rm src/services/demoService.ts
rm src/services/viewHistoryService.ts

# Phase 3: 依存関係の再インストール
npm install

# Phase 4: ビルドテスト
npx expo doctor
npx expo prebuild --clean
npx expo run:ios
```
