# Stilya - 環境変数管理ガイドライン

## 重要な方針

**Stilyaプロジェクトではローカルなサーバーは一切使用しません。**

- ❌ ローカルSupabase（localhost:54321）は使用しない
- ❌ `.env.local`ファイルは作成しない
- ✅ 常にオンラインのSupabaseを使用する
- ✅ `.env`ファイルのみで環境変数を管理する

## 環境変数設定

### 必須の環境変数（.env）

```env
# Supabase Configuration（オンラインのみ）
EXPO_PUBLIC_SUPABASE_URL=https://ycsydubuirflfuyqfshg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# その他の設定...
```

### 禁止事項

以下の設定は絶対に行わないでください：

```env
# ❌ 以下のような設定は禁止
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 開発フロー

### 1. 新規開発環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係をインストール
npm install

# .envファイルを作成（.env.exampleを参考に）
cp .env.example .env
# 必要な値を設定

# 開発ビルドで起動
npx expo start --dev-client
```

### 2. 実機テスト

```bash
# 必ず.env.localが存在しないことを確認
ls -la .env*

# 開発ビルドで起動
npx expo start --dev-client
```

### 3. トラブルシューティング

Network request failedエラーが発生した場合：

```bash
# 環境修正スクリプトを実行
./scripts/fix-env-for-production.sh

# または手動で修正
rm -f .env.local .env.local.backup
npx expo start --clear
```

## なぜローカルサーバーを使用しないのか

1. **実機テストの簡素化**
   - 実機からlocalhostにアクセスできない問題を回避
   - 複雑なネットワーク設定が不要

2. **開発環境の統一**
   - チーム全員が同じ環境で開発
   - 環境差異によるバグを防止

3. **MVP開発の高速化**
   - 環境設定に時間を使わない
   - 本番環境と同じ設定で開発

4. **GitHub Actionsとの互換性**
   - CI/CDパイプラインで同じ環境を使用
   - デプロイ時の問題を事前に発見

## チェックリスト

開発開始前に以下を確認：

- [ ] `.env.local`ファイルが存在しないこと
- [ ] `.env`にオンラインSupabase URLが設定されていること
- [ ] `localhost`を含むURLが設定されていないこと
- [ ] 実機でネットワーク接続が可能なこと

---

最終更新日: 2025年1月15日
