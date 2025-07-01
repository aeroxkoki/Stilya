# Supabase RLS Policy Fix - 2025/07/01

## 問題

開発ビルドでスワイプ機能を使用した際に以下のエラーが発生：
```
ERROR ** Error saving swipe result: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy (USING expression) for table \"swipes\""}
```

## 原因

- `swipes`テーブルに適切なRow-Level Security (RLS)ポリシーが設定されていなかった
- 他のユーザー関連テーブルにも同様の問題があった

## 解決策

以下のテーブルに適切なRLSポリシーを設定：

### 1. swipesテーブル
- ユーザーは自分のスワイプデータのみ操作可能
- INSERT、SELECT、UPDATE、DELETE全ての操作に対してポリシーを設定

### 2. その他のテーブル
- favorites: ユーザーは自分のお気に入りのみ管理可能
- click_logs: ユーザーは自分のクリックログのみ挿入・閲覧可能
- profiles: ユーザーは自分のプロフィールのみ管理可能
- saved_items: ユーザーは自分の保存アイテムのみ管理可能
- users: ユーザーは自分のデータのみ閲覧・更新可能

## 適用されたマイグレーション

1. `20250701_fix_swipes_rls_policy.sql`
2. `20250701_fix_all_rls_policies.sql`

## テスト方法

アプリを再起動して、スワイプ機能が正常に動作することを確認してください。

## 今後の注意点

新しいテーブルを作成する際は、必ず適切なRLSポリシーを設定すること。
