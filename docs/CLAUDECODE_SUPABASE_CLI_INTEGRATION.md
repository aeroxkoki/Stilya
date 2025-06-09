# ClaudeCode - Supabase CLI 連携ドキュメント

## 公式声明

このドキュメントは、ClaudeCodeがSupabase CLIを使用してStilyaプロジェクトの開発を支援できることを正式に文書化したものです。

作成日: 2025年6月9日  
プロジェクト: Stilya  
対象環境: /Users/koki_air/Documents/GitHub/Stilya

---

## 1. 概要

ClaudeCodeは、Bashコマンドの実行機能を通じて、Supabase CLIのすべての機能にアクセスし、実行することができます。これにより、開発者はClaudeCodeと対話しながら、Supabaseのローカル開発環境を管理できます。

### 1.1 利用可能な環境

- **Supabase CLI バージョン**: 2.24.3
- **プロジェクトパス**: `/Users/koki_air/Documents/GitHub/Stilya`
- **実行方法**: `npx supabase` コマンド経由

---

## 2. 利用可能な操作

### 2.1 環境管理

```bash
# Supabaseローカル環境の起動
npx supabase start

# Supabaseローカル環境の停止
npx supabase stop

# 環境の状態確認
npx supabase status
```

### 2.2 データベース管理

```bash
# 新しいマイグレーションの作成
npx supabase migration new <migration_name>

# データベースのリセット
npx supabase db reset

# スキーマの差分確認
npx supabase db diff

# リモートからスキーマを取得
npx supabase db pull

# ローカルの変更をリモートに適用
npx supabase db push
```

### 2.3 型定義生成

```bash
# TypeScript型定義の生成
npx supabase gen types typescript --local > src/types/database.types.ts
```

### 2.4 プロジェクト管理

```bash
# プロジェクトの初期化
npx supabase init

# リモートプロジェクトとのリンク
npx supabase link --project-ref <project-id>

# プロジェクトのリンク解除
npx supabase unlink
```

---

## 3. ClaudeCodeでの実行例

### 3.1 環境状態の確認

```typescript
// ClaudeCodeへのリクエスト例
"Supabaseの起動状態を確認してください"

// ClaudeCodeの実行
await bash("cd /Users/koki_air/Documents/GitHub/Stilya && npx supabase status")
```

### 3.2 マイグレーションの作成

```typescript
// ClaudeCodeへのリクエスト例
"user_preferencesテーブルを追加するマイグレーションを作成してください"

// ClaudeCodeの実行
await bash("cd /Users/koki_air/Documents/GitHub/Stilya && npx supabase migration new add_user_preferences")
// その後、生成されたファイルを編集
```

### 3.3 データベースのリセット

```typescript
// ClaudeCodeへのリクエスト例
"データベースをクリーンな状態にリセットしてください"

// ClaudeCodeの実行
await bash("cd /Users/koki_air/Documents/GitHub/Stilya && npx supabase db reset")
```

---

## 4. 実行可能な高度な操作

### 4.1 ファイル操作との連携

ClaudeCodeは以下の操作を組み合わせて実行できます：

1. **マイグレーションファイルの作成と編集**
   ```bash
   # マイグレーション作成
   npx supabase migration new feature_name
   
   # ファイルの内容を編集
   # ClaudeCodeがSQLを生成して保存
   ```

2. **設定ファイルの更新**
   - `supabase/config.toml`の編集
   - `seed.sql`の更新
   - 環境変数ファイルの管理

3. **型定義の自動更新**
   ```bash
   # スキーマ変更後の型更新
   npx supabase gen types typescript --local > src/types/database.types.ts
   ```

### 4.2 トラブルシューティング

ClaudeCodeは以下の診断と修正が可能：

- Docker接続問題の診断
- プロキシ設定の調整
- 環境変数の検証
- エラーログの分析

---

## 5. 制限事項と注意点

### 5.1 実行時の制限

- **タイムアウト**: 長時間実行されるコマンドは300秒でタイムアウトする可能性があります
- **インタラクティブ操作**: パスワード入力などの対話的な操作は実行できません
- **GUI操作**: Supabase StudioのようなWeb UIは直接操作できません

### 5.2 セキュリティ上の注意

- 機密情報（APIキー、パスワード）は環境変数で管理
- 本番環境への直接的な変更は慎重に行う
- データベースのバックアップを定期的に実施

---

## 6. ベストプラクティス

### 6.1 開発フロー

1. **変更前の状態確認**
   ```bash
   npx supabase status
   npx supabase db diff
   ```

2. **変更の実施**
   - マイグレーションファイルの作成
   - SQLの記述
   - テストデータの準備

3. **変更の適用と検証**
   ```bash
   npx supabase db reset
   npx supabase gen types typescript --local
   ```

### 6.2 チーム開発での活用

- マイグレーションファイルはGitで管理
- 型定義ファイルは自動生成を基本とする
- ローカル環境の再現性を確保

---

## 7. サポートされるユースケース

### 7.1 初期セットアップ
- プロジェクトの初期化
- データベーススキーマの構築
- テストデータの投入

### 7.2 日常的な開発
- スキーマの変更と検証
- 型定義の更新
- データのテスト

### 7.3 トラブルシューティング
- 環境の診断
- エラーの解決
- 設定の調整

---

## 8. 今後の展望

ClaudeCodeとSupabase CLIの連携により、以下が期待されます：

1. **開発効率の向上**
   - 自然言語での指示によるCLI操作
   - 複雑な操作の自動化

2. **エラー削減**
   - コマンドの正確な実行
   - ベストプラクティスの自動適用

3. **学習コストの低減**
   - CLIコマンドの詳細を覚える必要なし
   - 対話的な開発支援

---

## 9. 結論

ClaudeCodeは、Supabase CLIの全機能を活用して、Stilyaプロジェクトの開発を包括的に支援できます。開発者は自然言語でClaudeCodeに指示を出すだけで、複雑なCLI操作を実行できます。

この連携により、開発の生産性が向上し、エラーが減少し、より良い開発体験が実現されます。

---

## 付録: よく使用されるコマンドリファレンス

```bash
# 環境管理
npm run supabase:start    # 起動（プロキシ回避版）
npm run supabase:stop     # 停止
npm run supabase:status   # 状態確認

# データベース操作
npm run db:reset          # リセット
npm run db:migrate        # マイグレーション作成
npm run db:diff           # 差分確認
npm run supabase:types    # 型生成

# トラブルシューティング
npm run docker:fix-proxy  # Dockerプロキシ修正
```

---

**文書作成者**: ClaudeCode  
**承認**: Stilyaプロジェクトチーム  
**最終更新**: 2025年6月9日