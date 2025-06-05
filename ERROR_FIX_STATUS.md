# Stilya プロジェクト - エラー修正状況

## 最新の修正（2025/06/05）

### ✅ Supabase PGRST116 エラー修正完了
- **エラー内容**: 
  - `JSON object requested, multiple (or no) rows returned`
  - getUserProfile関数で.single()使用時に0件の結果でエラー発生
- **原因**:
  - 認証されたユーザーのプロファイルがpublic.usersテーブルに存在しない
  - .single()メソッドは1件の結果を期待するが、0件返されたためエラー
- **修正内容**:
  1. supabase.ts: `.single()` → `.maybeSingle()` に変更
  2. AuthContext.tsx: プロファイルが存在しない場合は自動作成する処理を追加
- **影響範囲**: 
  - 初回ログイン時のユーザープロファイル作成
  - アプリ起動時のセッション初期化処理

## 修正履歴（2025/06/04）

### ✅ Expo SDK 53.0.9 アップグレード完了
- **実施内容**:
  - Expo: 53.0.7 → 53.0.9
  - app.config.js から `jsEngine: "jsc"` を削除（SDK 53で廃止）
  - .npmrc に `legacy-peer-deps=true` を追加
  - すべての依存関係を SDK 53.0.9 互換バージョンに更新
- **結果**: 
  - `npx expo-doctor` で15項目すべて合格
  - PlatformConstants エラーなども含めて完全に解決

## 修正完了内容

### 1. PlatformConstants エラー対策
- React Native: 0.75.0 → 0.74.5（Expo SDK 53対応）
- Metro関連パッケージ: 0.82.4 → 0.80.12 → ~0.81.0（最終調整）
- babel-preset-expo: 13.1.11 → ~12.0.0（互換性向上）

### 2. Supabase認証エラー対策
- getUserProfile関数で.maybeSingle()を使用
- プロファイル自動作成処理の追加
- エラーハンドリングの改善

### 3. Git履歴
```
(最新) fix: Supabase PGRST116 error - profile auto-creation
55408b2 fix: データベーススキーマ初期化の実行順序を修正
6108d81 fix: データベーススキーマ初期化スクリプトのエラー対策
58c7f7f fix: データベーススキーマ初期化スクリプトの追加と認証エラーの解決
2902ac8 chore: regenerate package-lock.json with updated dependencies
c278e57 fix: Metro and babel-preset-expo versions for Expo SDK 53 compatibility
```

### 4. 次のステップ

開発サーバーを起動してください：
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npx expo start --clear
```

または作成した起動スクリプトを使用：
```bash
./start-dev.sh
```

## トラブルシューティング

エラーが続く場合は以下を実行：

1. **Expo Goアプリの削除と再インストール**
   - シミュレータからExpo Goを削除
   - App Storeから最新版を再インストール

2. **完全なキャッシュクリア**
   ```bash
   rm -rf .expo
   rm -rf $TMPDIR/react-*
   rm -rf $TMPDIR/metro-*
   watchman watch-del-all 2>/dev/null || true
   ```

3. **データベース初期化（必要な場合）**
   ```bash
   # Supabaseダッシュボードでスキーマを再実行
   # scripts/create-schema.sql を使用
   ```

## 修正された依存関係

| パッケージ | 旧バージョン | 新バージョン |
|-----------|------------|-------------|
| react-native | 0.75.0 | 0.74.5 |
| metro | 0.82.4 | ~0.81.0 |
| metro-config | 0.82.4 | ~0.81.0 |
| metro-core | 0.82.4 | ~0.81.0 |
| babel-preset-expo | 13.1.11 | ~12.0.0 |

## 修正されたファイル（最新）

| ファイル | 修正内容 |
|----------|----------|
| src/services/supabase.ts | getUserProfile: .single() → .maybeSingle() |
| src/contexts/AuthContext.tsx | プロファイル自動作成処理を追加（2箇所） |
