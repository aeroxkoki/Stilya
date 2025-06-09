# Supabase使用方針

## 概要

本プロジェクト（Stilya）では、Claudecodeによる開発環境でSupabase CLIが利用可能ですが、**開発および本番環境では一貫してオンラインのSupabaseインスタンスを使用します**。

## 環境別の使用方法

### 🔧 開発環境
- **使用するSupabase**: オンライン（https://ddypgpljprljqrblpuli.supabase.co）
- **起動コマンド**: `npm run start`
- **接続先**: 本番と同じオンラインインスタンス

### 🚀 本番環境
- **使用するSupabase**: オンライン（https://ddypgpljprljqrblpuli.supabase.co）
- **デプロイ**: EAS Build経由
- **認証情報**: EAS Secretsで管理

### 💻 Claudecode環境（データベース編集用）
- **Supabase CLI**: 利用可能
- **用途**: マイグレーション作成、スキーマ変更、型生成など
- **注意**: ローカルSupabaseインスタンスは開発・本番では使用しません

## 重要な注意事項

1. **`npm run start:local`は使用しない** - これはローカルSupabase用で、通常の開発では不要です
2. **実機テストは必ず`npm run start`で実行** - オンラインSupabaseに接続されます
3. **データベースの変更はSupabase CLIでマイグレーションを作成**し、オンラインに適用します

## Supabase CLI使用例

```bash
# スキーマの変更を取得
supabase db pull

# 新しいマイグレーションを作成
supabase migration new add_new_table

# TypeScript型を生成
supabase gen types typescript --project-id ddypgpljprljqrblpuli > src/types/database.types.ts

# 変更をオンラインに適用
supabase db push
```

## まとめ

- **開発 = オンラインSupabase**
- **本番 = オンラインSupabase**
- **Supabase CLI = データベース管理ツールとして使用**

これにより、開発と本番で同じデータベース構造を保証し、環境差異によるバグを防ぎます。
