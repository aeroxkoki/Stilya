# プロジェクトアーキテクチャ

## 概要

Stilyaは、React Native (Expo) + TypeScript + Supabaseを使用したモバイルファーストのアプリケーションです。MVPフェーズでは、シンプルかつ拡張可能なアーキテクチャを採用しています。

## 技術スタック

### フロントエンド
- **React Native**: 0.79.2
- **Expo**: SDK 53.0.9 (Managed Workflow)
- **TypeScript**: 5.3.0
- **React Navigation**: v6

### バックエンド
- **Supabase**: BaaS（認証・DB・ストレージ）
- **PostgreSQL**: データベース（Supabase提供）

### 開発ツール
- **EAS Build**: クラウドビルドサービス
- **GitHub Actions**: CI/CD
- **Supabase CLI**: 型生成専用（開発時のみ）

## ディレクトリ構造

```
Stilya/
├── src/                      # ソースコード
│   ├── components/           # 再利用可能なUIコンポーネント
│   │   ├── common/          # 汎用コンポーネント
│   │   ├── product/         # 商品関連コンポーネント
│   │   └── ui/              # UIコンポーネント
│   ├── screens/             # 画面コンポーネント
│   │   ├── auth/           # 認証関連画面
│   │   ├── main/           # メイン画面
│   │   └── profile/        # プロフィール画面
│   ├── navigation/          # ナビゲーション設定
│   ├── services/            # API・ビジネスロジック
│   │   ├── api/           # API通信
│   │   ├── auth/          # 認証サービス
│   │   └── product/       # 商品サービス
│   ├── contexts/            # React Context
│   ├── hooks/               # カスタムフック
│   ├── types/               # TypeScript型定義
│   ├── utils/               # ユーティリティ関数
│   └── tests/               # テストコード
├── assets/                  # 静的リソース
├── scripts/                 # ビルド・ユーティリティスクリプト
├── docs/                    # ドキュメント
└── App.tsx                  # アプリケーションエントリーポイント
```

## アーキテクチャパターン

### 1. レイヤードアーキテクチャ

```
┌─────────────────────────────────────┐
│          Presentation Layer         │
│    (Screens, Components, UI)        │
├─────────────────────────────────────┤
│          Business Logic Layer       │
│    (Services, Hooks, Contexts)      │
├─────────────────────────────────────┤
│          Data Access Layer          │
│    (Supabase Client, API)          │
└─────────────────────────────────────┘
```

### 2. コンポーネント設計

- **Presentational Components**: UIのみを担当
- **Container Components**: ビジネスロジックとステート管理
- **Screen Components**: 画面単位のコンポーネント

### 3. 状態管理

```typescript
// グローバル状態: React Context
AuthContext    // 認証状態
ProductContext // 商品データ

// ローカル状態: useState/useReducer
// 各コンポーネントで管理
```

## データフロー

```
User Action → Component → Hook/Service → Supabase → Database
     ↑                         ↓
     └──── State Update ←──────┘
```

## 型安全性

### 自動型生成

```bash
npm run types:generate
```

Supabaseのスキーマから自動的に型を生成し、`src/types/database.types.ts`に配置。

### 型の使用例

```typescript
import { Database } from '@/types/database.types';

// テーブル型
type User = Database['public']['Tables']['users']['Row'];
type Product = Database['public']['Tables']['external_products']['Row'];

// Supabaseクライアントの型付け
const supabase = createClient<Database>(url, key);
```

## セキュリティ

### 1. 環境変数

- 機密情報は環境変数で管理
- `.env`ファイルはGitに含めない
- EAS Secretsで本番環境の秘密情報を管理

### 2. Row Level Security (RLS)

Supabaseで以下のポリシーを実装：
- ユーザーは自分のデータのみアクセス可能
- 公開データは認証なしでアクセス可能

### 3. API キー管理

- Anonキーはクライアントで使用（公開可能）
- Service Roleキーは使用しない（サーバーサイドのみ）

## パフォーマンス最適化

### 1. 画像最適化
- Expo Imageコンポーネントを使用
- 適切なキャッシュ戦略

### 2. データフェッチング
- 必要なデータのみ取得
- ページネーション実装
- オフラインキャッシュ

### 3. コード分割
- 遅延ロード（将来実装）
- 不要なimportの削除

## 開発ワークフロー

### 1. 機能開発

```bash
# 1. featureブランチ作成
git checkout -b feature/new-feature

# 2. 開発
npm start

# 3. 型生成（スキーマ変更時）
npm run types:generate

# 4. テスト
npm test

# 5. コミット・プッシュ
git add .
git commit -m "feat: 新機能実装"
git push origin feature/new-feature
```

### 2. デバッグ

開発メニュー（`EXPO_PUBLIC_DEBUG_MODE=true`）から：
- Supabase接続テスト
- ネットワークデバッグ
- MVPテスト実行

## 今後の拡張計画

### Phase 1 (現在): MVP
- 基本的なCRUD操作
- シンプルな推薦ロジック
- 最小限のUI/UX

### Phase 2: 機能拡張
- CLIPベース画像推薦
- リアルタイム機能
- プッシュ通知

### Phase 3: スケーリング
- マイクロサービス化
- GraphQL導入
- パフォーマンス最適化

## 関連ドキュメント

- [開発ガイドライン](./DEVELOPMENT_GUIDELINES.md)
- [Supabase型生成ガイド](./SUPABASE_TYPE_GENERATION.md)
- [環境変数設定ガイド](./EAS_ENVIRONMENT_VARIABLES.md)
