# Stilya プロジェクト - GitHub活用宣言

## 公式声明

本文書により、Stilyaプロジェクトは開発プロセス全体においてGitHubをバージョン管理およびコラボレーションプラットフォームとして正式に採用することを宣言します。

## 目的

GitHubを採用する主な目的は以下の通りです：
- ソースコードの一元管理とバージョン履歴の保持
- 開発プロセスの透明性と追跡可能性の確保
- チームメンバー間のコラボレーション強化
- コードレビュープロセスの標準化
- 継続的インテグレーション/継続的デリバリー(CI/CD)パイプラインの実現
- プロジェクト管理の効率化

## リポジトリ管理

1. メインリポジトリ: `https://github.com/aeroxkoki/Stilya`
2. アクセス権は必要に応じてチームメンバーに付与
3. 機密情報（API キー、認証情報など）はリポジトリに保存せず、環境変数として管理

## ブランチ戦略

以下のブランチ戦略を採用します：
- `main`: 本番環境用の安定版コード
- `develop`: 開発用の統合ブランチ
- `feature/xxx`: 新機能開発用ブランチ
- `bugfix/xxx`: バグ修正用ブランチ
- `release/x.x.x`: リリース準備用ブランチ

## コミットメッセージ規約

すべてのコミットメッセージは以下の形式に従います：
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイル変更（機能に影響しない）
- `refactor:` リファクタリング
- `perf:` パフォーマンス改善
- `test:` テスト関連
- `chore:` ビルドプロセスやツール変更

## 開発ワークフロー

1. 新機能やバグ修正は GitHub Issues で追跡
2. 各タスクは適切なブランチで作業
3. 作業完了後、develop ブランチに対してプルリクエストを作成
4. コードレビュー後、問題がなければマージ
5. 定期的に develop から main へのリリースを実施

## GitHub 機能の活用

- **Issues**: タスク管理とバグ追跡
- **Projects**: プロジェクト進捗管理
- **Actions**: CI/CDパイプラインの自動化
- **Pull Requests**: コードレビューとマージ管理
- **Releases**: バージョン管理とリリースノート

## セキュリティ対策

- リポジトリへの直接プッシュは禁止し、プルリクエスト経由でのマージを義務付け
- Secrets や環境変数を使用して機密情報を保護
- 定期的なセキュリティレビューの実施
- 脆弱性スキャンツールの活用

## 結論

本プロジェクトにおけるGitHubの採用は、開発プロセスの効率化、品質向上、チームコラボレーションの強化を目的としています。すべてのチームメンバーは、本文書で定められたガイドラインに従い、GitHubを積極的に活用することが求められます。

# Stilya プロジェクト開発フロー

このドキュメントでは、Stilyaプロジェクトの開発フローについて説明します。GitHubリポジトリを使用した効率的な開発プロセスを導入することで、品質の高いコード管理と円滑なチーム連携を実現します。

## リポジトリ情報

- **リモートリポジトリ**: `https://github.com/aeroxkoki/Stilya`
- **ブランチ構成**:
  - `main`: 本番環境用の安定版コード
  - `develop`: 開発用の統合ブランチ
  - `feature/xxx`: 新機能開発用ブランチ
  - `bugfix/xxx`: バグ修正用ブランチ
  - `release/x.x.x`: リリース準備用ブランチ

## ブランチ戦略 (Git Flow)

```
main ----------*-----------------------*-----> (本番リリース)
                \                     /
develop ---*-----*--*--*--*---------*--------> (開発統合)
            \     \    \ /        /
feature/A ----*----*              (新機能開発)
                     \    /
feature/B -------------*--*         (新機能開発)
                           \
                            \
bugfix/X ---------------------*     (バグ修正)
                                \
release/1.0.0 -------------------*--*  (リリース準備)
```

## コミットメッセージ規約

すべてのコミットメッセージは、以下の形式に従います：

- `feat:` - 新機能の追加
- `fix:` - バグ修正
- `docs:` - ドキュメントの変更
- `style:` - コードスタイルの変更（機能に影響しない）
- `refactor:` - リファクタリング
- `perf:` - パフォーマンス改善
- `test:` - テストの追加・修正
- `chore:` - ビルドプロセスやツールの変更

例：
```
feat: スワイプUIの実装
fix: 画像読み込みエラーの修正
docs: README.mdの更新
```

## 開発ワークフロー

### 1. 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# .envファイルの設定
cp .env.example .env
# .envファイルを編集して実際の値を設定
```

### 2. 機能開発の開始

```bash
# developブランチの最新化
git checkout develop
git pull origin develop

# 機能開発用のブランチを作成
git checkout -b feature/new-feature-name

# 開発作業を行う...
```

### 3. 変更のコミットとプッシュ

```bash
# 変更状態の確認
git status

# 変更のステージング
git add .
# または特定のファイルのみ
git add src/components/NewComponent.tsx

# コミット
git commit -m "feat: 新機能の実装"

# リモートにプッシュ
git push origin feature/new-feature-name
```

### 4. プルリクエスト (PR)

1. GitHubのリポジトリページにアクセス
2. 「Pull requests」タブを選択
3. 「New pull request」ボタンをクリック
4. ベースブランチに `develop`、比較ブランチに作業ブランチを選択
5. 「Create pull request」をクリック
6. PRのタイトルと説明を記入（変更内容、関連する課題、テスト方法など）
7. レビュアーを指定
8. 「Create pull request」で作成

### 5. コードレビュー

1. レビュアーは変更内容を確認
2. 必要に応じて修正依頼をコメント
3. 修正が必要な場合は作業ブランチで変更を行い、再度プッシュ
4. レビュー承認後、PRをマージ

### 6. リリース準備

```bash
# developブランチの最新化
git checkout develop
git pull origin develop

# リリース用ブランチの作成
git checkout -b release/1.0.0

# 必要な修正を行い、コミット
git commit -m "chore: バージョン番号の更新"

# リモートにプッシュ
git push origin release/1.0.0
```

### 7. 本番リリース

```bash
# mainブランチに切り替え
git checkout main
git pull origin main

# リリースブランチをマージ
git merge release/1.0.0

# バージョンタグの作成
git tag -a v1.0.0 -m "Version 1.0.0"

# リモートにプッシュ（タグ含む）
git push origin main --tags
```

## 継続的インテグレーション (CI)

プロジェクトではGitHub Actionsを使用した継続的インテグレーションを導入しています。

- `develop`ブランチへのプッシュ/マージ時に自動テスト実行
- `main`ブランチへのマージ時に自動ビルドとデプロイ

## バグ修正フロー

緊急のバグ修正が必要な場合：

```bash
# mainブランチから修正ブランチを作成
git checkout main
git checkout -b bugfix/critical-issue

# 修正を実装...

# コミット
git commit -m "fix: 重大なバグの修正"

# プッシュ
git push origin bugfix/critical-issue
```

その後、`main`ブランチと`develop`ブランチの両方に対してPRを作成します。

## 開発サイクル

1. **計画**：機能要件の定義、タスクの分割
2. **開発**：機能ブランチでの実装
3. **レビュー**：プルリクエストによるコードレビュー
4. **テスト**：自動テストと手動テスト
5. **統合**：developブランチへのマージ
6. **リリース**：リリースブランチの作成とmainへのマージ
7. **デプロイ**：本番環境へのデプロイ

## トラブルシューティング

### コンフリクトの解決

```bash
# developブランチの最新化
git checkout develop
git pull origin develop

# 作業ブランチに戻る
git checkout feature/your-feature

# developブランチをマージ
git merge develop

# コンフリクトを解決...

# 解決後にコミット
git add .
git commit -m "chore: developとのコンフリクト解決"
```

### コミットの取り消し

```bash
# 直前のコミットを取り消し（変更は保持）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消し（変更も破棄）
git reset --hard HEAD~1
```

## 環境設定

### .gitignore

重要な情報やローカル環境ファイルは`.gitignore`に追加して、リポジトリに含めないようにしています。特に：

```
# 環境変数ファイル
.env
.env.local
.env*.local

# 依存関係
node_modules/

# ビルドファイル
dist/
build/
```

## ベストプラクティス

1. 機能ブランチは短期間で完結する小さな変更にする
2. コミットは論理的なまとまりで行い、詳細なコミットメッセージを書く
3. プッシュする前にローカルでテストを実行する
4. 定期的に`develop`ブランチからの変更を取り込む
5. コードの変更はすべてレビューを受ける
6. CIのテスト結果を常に確認する

---

この開発フローに従うことで、効率的かつ品質の高い開発プロセスを維持し、チーム全体の生産性向上を目指します。

---

日付: 2025年5月13日

承認者: [プロジェクトオーナー]
