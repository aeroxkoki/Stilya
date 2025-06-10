# Supabase 型生成ガイド

## 概要

Stilyaプロジェクトでは、Supabase CLIを**型生成専用**で使用しています。これにより、TypeScriptの型安全性を保ちながら、MVP開発を効率的に進められます。

## セットアップ

### 前提条件

- Node.js 18以上
- オンラインSupabaseプロジェクトへのアクセス権

### 初回セットアップ

型生成は`npx`を使用するため、Supabase CLIのインストールは不要です。

## 使用方法

### 1. 型の生成

データベーススキーマから型を自動生成：

```bash
npm run types:generate
```

これにより、`src/types/database.types.ts`ファイルが更新されます。

### 2. 型生成のタイミング

以下の場合に型を再生成してください：

- データベーススキーマを変更した時
- 新しいテーブルを追加した時
- カラムの型を変更した時
- RLSポリシーを更新した時（型には影響しませんが、確認のため）

### 3. 型の使用例

```typescript
import { Database } from '@/types/database.types';

// テーブル型の使用
type User = Database['public']['Tables']['users']['Row'];
type Product = Database['public']['Tables']['external_products']['Row'];

// Insert型の使用
type NewSwipe = Database['public']['Tables']['swipes']['Insert'];

// Supabaseクライアントの型付け
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 注意事項

### 1. 環境の分離

- **開発環境**: オンラインSupabaseを直接使用
- **型生成**: オンラインSupabaseから取得
- **ローカルDB**: 使用しない（実機テストでの問題を回避）

### 2. セキュリティ

- 型ファイル（`database.types.ts`）には機密情報は含まれません
- プロジェクトIDは公開情報です
- API キーは含まれません

### 3. Gitでの管理

- `src/types/database.types.ts`はコミット対象
- 型生成用の一時ファイルは`.gitignore`で除外

## トラブルシューティング

### エラー: "supabase command not found"

npxを使用しているため、このエラーは発生しないはずですが、もし発生した場合：

```bash
# キャッシュをクリア
npx clear-npx-cache

# 再度実行
npm run types:generate
```

### エラー: "Invalid project ref"

プロジェクトIDが正しいか確認：

1. Supabaseダッシュボードでプロジェクトを開く
2. Settings > General でプロジェクトIDを確認
3. `package.json`の`types:generate`スクリプトを更新

### 型が古い

Supabaseのスキーマ変更が反映されるまで数秒かかることがあります：

```bash
# 少し待ってから再実行
sleep 5 && npm run types:generate
```

## ベストプラクティス

1. **定期的な型生成**
   - スキーマ変更後は必ず型を再生成
   - PRを作成する前に型を最新化

2. **型の活用**
   - すべてのSupabase操作で型を使用
   - `any`型の使用を避ける

3. **チーム開発**
   - スキーマ変更時は他のメンバーに通知
   - 型ファイルの変更はコミットに含める

## 関連ドキュメント

- [Supabase TypeScript サポート](https://supabase.com/docs/reference/javascript/typescript-support)
- [プロジェクトアーキテクチャ](./PROJECT_ARCHITECTURE.md)
- [開発ガイドライン](./DEVELOPMENT_GUIDELINES.md)
