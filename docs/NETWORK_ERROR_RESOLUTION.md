# 実機ネットワークエラー解決レポート

## 問題
実機（Expo Go）で「Network request failed」エラーが発生

## 原因
1. **Supabase CLI関連の設定が残存**
   - ローカルSupabase（localhost）への接続試行
   - 環境変数での切り替え設定が実機で問題を引き起こす

2. **古いSupabase URLの使用**
   - 以前のプロジェクトURL（ddypgpljprljqrblpuli）が使用されていた
   - 正しいプロジェクトID（ycsydubuirflfuyqfshg）への更新が必要

## 実施した解決策

### 1. ローカルSupabase設定の完全削除
```typescript
// src/utils/env.ts から削除
- export const IS_LOCAL_SUPABASE = process.env.EXPO_PUBLIC_USE_LOCAL_SUPABASE === 'true';
- if (IS_LOCAL_SUPABASE) { ... }
```

### 2. package.jsonの修正
```json
// ローカルSupabase起動スクリプトを削除
- "start:local": "EXPO_PUBLIC_USE_LOCAL_SUPABASE=true expo start",
```

### 3. 環境変数の更新（.env）
```env
# 正しいプロジェクトIDに更新
EXPO_PUBLIC_SUPABASE_URL=https://ycsydubuirflfuyqfshg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. ネットワークデバッグツールの追加
新しいデバッグ画面（`src/screens/debug/NetworkDebugScreen.tsx`）で以下をテスト：
- ネットワーク接続状態
- Supabase接続
- 楽天API接続
- インターネット接続（Google DNS）
- 環境変数の確認

## 今後の対応

### 実機でエラーが発生した場合

1. **キャッシュクリア**
   ```bash
   npm run clear-cache
   # または
   ./scripts/fix-network-error.sh
   ```

2. **環境変数確認**
   ```bash
   npm run check-env
   ```

3. **デバッグモード有効化**
   ```bash
   echo 'EXPO_PUBLIC_DEBUG_MODE=true' >> .env
   ```

4. **アプリ内でネットワーク診断**
   - 開発メニュー → ネットワークデバッグ
   - 各接続テストを実行

### 推奨事項

1. **常にオンラインSupabaseを使用**
   - 実機テストではローカルSupabaseは使用不可
   - 開発もオンラインSupabaseで統一

2. **環境変数の管理**
   - `.env`ファイルはGitにコミットしない
   - チーム間で正しい値を共有

3. **ネットワーク環境の確認**
   - 実機とPCが同じネットワーク上にあること
   - VPNを無効化
   - ファイアウォール設定を確認

## まとめ

Supabase CLI導入時の設定が実機でのネットワークエラーの原因でした。ローカルSupabase関連の設定を完全に削除し、オンラインSupabaseのみを使用する構成に戻すことで、問題を根本的に解決しました。

今後はSupabase CLIは型生成専用として使用し、実機テストへの影響を避けます。
