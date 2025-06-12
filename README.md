# 🎯 Stilya - パーソナライズ型ファッション提案アプリ（MVP）

![Build Status](https://github.com/aeroxkoki/Stilya/actions/workflows/build.yml/badge.svg)

"スワイプで、あなたの「好き」が見つかる。"

## 📋 概要

Stilya（スティルヤ）は、Yes/Noのスワイプ操作でユーザーのファッションの好みを学習し、パーソナライズされたアイテムを提案するモバイルアプリです。

### 主な特徴
- 🎴 **直感的なスワイプUI** - Tinder風のUIで商品を評価
- 🤖 **AI推薦機能** - 好みを学習して最適な商品を提案
- 🛍️ **アフィリエイト連携** - 気に入った商品は外部ECサイトで購入可能
- 📱 **モバイルファースト** - iOS/Android対応のネイティブアプリ

## 🚀 開発環境セットアップ

### 必要な環境
- Node.js (v18以上)
- npm または yarn
- Expo CLI
- iOS Simulator (Mac) または Android Emulator

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/aeroxkoki/Stilya.git
cd Stilya

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してSupabase情報を設定

# データベースの初期化（初回のみ）
# 詳細は docs/DATABASE_INITIALIZATION_GUIDE.md を参照
```

### 起動方法

#### 開発ビルド（推奨）

Stilyaは**開発ビルド**を使用します。Expo Goは使用しません。

```bash
# 1. 開発ビルドを作成（初回のみ）
npm run eas-build-development

# 2. 開発サーバーの起動
npm start  # --dev-clientフラグが自動的に付与されます

# 3. 実機の開発ビルドアプリ（Stilya）で接続
```

詳細は [開発ビルド設定ガイド](./docs/DEVELOPMENT_BUILD_GUIDE.md) を参照してください。

#### シミュレーター/エミュレーター

```bash
# iOSシミュレーターで起動
npm run ios

# Androidエミュレーターで起動
npm run android
```

## 🧪 ローカルテスト

### MVP機能テストの実行方法

#### 方法1: CLIから基本チェック
```bash
npm test
```
基本的な環境変数の設定確認を行います。

#### 方法2: アプリ内でテスト実行（推奨）
1. `npm start` でアプリを起動
2. デバッグモードが有効な場合、画面右下に🛠️ボタンが表示されます
   ```env
   # .envファイルに追加
   EXPO_PUBLIC_DEBUG_MODE=true
   ```
3. ボタンをタップして開発メニューを開く
4. 「🧪 MVPテストを実行」をタップ

### テスト項目
- ✅ 環境変数チェック
- ✅ Supabase接続テスト（デモモードではスキップ）
- ✅ 認証機能テスト（デモモードではスキップ）
- ✅ 商品データ取得テスト
- ✅ スワイプ機能テスト
- ✅ 推薦ロジックテスト
- ✅ UIコンポーネント確認
- ✅ 外部リンク遷移テスト
- ✅ パフォーマンステスト

### デモモードでのテスト
デモモード（`EXPO_PUBLIC_DEMO_MODE=true`）では、Supabase関連のテストは自動的にスキップされ、ローカルデータを使用したテストが実行されます。

## 📁 プロジェクト構造

```
Stilya/
├── src/
│   ├── components/      # 再利用可能なUIコンポーネント
│   ├── screens/         # 画面コンポーネント
│   ├── navigation/      # ナビゲーション設定
│   ├── services/        # API・ビジネスロジック
│   ├── contexts/        # React Context
│   ├── hooks/           # カスタムフック
│   ├── types/           # TypeScript型定義
│   ├── utils/           # ユーティリティ関数
│   └── tests/           # テストコード
├── assets/              # 画像・フォントなどのリソース
├── scripts/             # ビルド・デプロイスクリプト
└── App.tsx              # エントリーポイント
```


## 🛠️ 技術スタック

- **フロントエンド**: React Native + Expo (SDK 53.0.9)
- **言語**: TypeScript
- **バックエンド**: Supabase
- **状態管理**: React Context + Hooks
- **ナビゲーション**: React Navigation
- **ビルド**: EAS Build
- **Node.js**: v18以上推奨（v23.10.0で動作確認済み）

## 🔐 環境変数

```env
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# アプリ設定
EXPO_PUBLIC_DEBUG_MODE=true  # 開発メニューの表示
EXPO_PUBLIC_DEMO_MODE=true   # デモモード（ローカルデータ使用）

# アフィリエイトAPI（将来実装）
LINKSHARE_API_TOKEN=your_token
RAKUTEN_APP_ID=your_app_id
```

## 📱 デモモード

`EXPO_PUBLIC_DEMO_MODE=true` に設定すると、Supabaseを使用せずにローカルのダミーデータで動作します。初期開発やテスト時に便利です。

## 🎯 MVP機能

### 実装済み
- ✅ ユーザー認証（メール/パスワード）
- ✅ スワイプUI（Yes/No）
- ✅ 商品表示・詳細画面
- ✅ タグベース推薦ロジック
- ✅ お気に入り機能
- ✅ スワイプ履歴
- ✅ プロフィール設定
- ✅ Supabase接続診断ツール（開発メニューから実行可能）

### 最新の修正 (2025-06-08)
- ✅ すべての`products`テーブル参照を`external_products`に統一
- ✅ Supabase接続エラーハンドリングの改善
- ✅ 開発ツールの整備（接続テスト、エラーチェック）
- 詳細は [SUPABASE_ERROR_CHECK_RESULT.md](./SUPABASE_ERROR_CHECK_RESULT.md) を参照
- ✅ オフライン対応

## 🏷️ MVP戦略

### 拡張MVPブランド（30ブランド）
ペルソナ（20-40代女性）に合わせて厳選した30ブランドを7カテゴリで展開：

- **ベーシック・定番**: UNIQLO, GU, 無印良品
- **ECブランド・D2C**: coca, pierrot, Re:EDIT, fifth, titivate
- **セレクトショップ**: URBAN RESEARCH, nano・universe, BEAMS, UNITED ARROWS, SHIPS
- **ライフスタイル**: studio CLIP, SM2, earth music&ecology, LOWRYS FARM
- **年齢層特化**: PLST, vis, ROPE, NATURAL BEAUTY BASIC
- **トレンド・個性派**: ZARA, H&M, SNIDEL, FRAY I.D
- **カジュアル**: WEGO, GLOBAL WORK, niko and..., coen

詳細は [拡張MVPブランドリスト](docs/EXTENDED_MVP_BRANDS_LIST.md) を参照してください。

### 段階的商品数増加システム
- 初回同期: 435商品（控えめスタート）
- 週次20%増加: 最大1,410商品まで自動拡張
- Supabase容量管理: 90,000件上限で自動調整

## 📚 開発ガイド

### 重要なドキュメント
- [開発ビルド設定ガイド](./docs/DEVELOPMENT_BUILD_GUIDE.md) - **必読**: 開発ビルドの作成と使用方法
- [Supabase使用方針](./docs/SUPABASE_USAGE_POLICY.md) - 開発・本番環境でのSupabase利用について
- [Supabase型生成ガイド](./docs/SUPABASE_TYPE_GENERATION.md) - TypeScript型の自動生成
- [環境変数設定ガイド](./docs/EAS_ENVIRONMENT_VARIABLES.md) - EAS Buildとローカルでの環境変数設定
- [ネットワークエラー解決](./docs/NETWORK_ERROR_RESOLUTION.md) - 実機でのネットワークエラー対処法

### TypeScript型の管理
データベーススキーマから型を自動生成できます：
```bash
# 型を生成
npm run types:generate

# 型チェックを実行
npm run types:check
```

### 開発の注意点
- 🚨 **開発ビルドを使用**（Expo Goは使用しない）
- 🚨 **開発・本番環境では必ずオンラインのSupabaseを使用**
- 🚨 **認証情報をコードにハードコードしない**（環境変数を使用）

### 今後の実装予定
- 🔄 CLIPベース画像推薦
- 🔄 スタイル診断機能
- 🔄 ソーシャル機能
- 🔄 プッシュ通知

## 🚀 デプロイ

### EAS Buildを使用したビルド

```bash
# プレビュー版ビルド
npm run eas-build-preview

# 本番版ビルド
npm run eas-build-production
```

## 📱 実機テスト

### iPhone実機テスト（5分で完了）
詳細ガイド: [IPHONE_QUICKSTART.md](./IPHONE_QUICKSTART.md)

```bash
# クイックスタート
cd /Users/koki_air/Documents/GitHub/Stilya
eas build --platform ios --profile development  # ビルド作成（初回のみ）
npm start  # 開発サーバー起動

# ビルド完了後、QRコードをカメラでスキャンしてインストール
```

### Android実機テスト
```bash
eas build --platform android --profile development
# APKをダウンロードしてインストール
```

### 実機テストドキュメント
- [iPhone準備ガイド](./docs/IPHONE_SETUP_GUIDE.md)
- [実機テストガイド](./TESTING_GUIDE.md)
- [テストチェックリスト](./TESTING_CHECKLIST.md)

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コミットメッセージ規約
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイル変更
- `refactor:` リファクタリング
- `test:` テスト関連
- `chore:` ビルド・ツール関連

## 🔧 トラブルシューティング

### 実機で「Network request failed」エラーが発生する場合

1. **ネットワークデバッグ画面を使用**
   - アプリ内の開発メニュー（右下の🛠ボタン）を開く
   - 「🌐 ネットワークデバッグ」を選択
   - 「Run Network Tests」を実行
   - 各APIの接続状態を確認

2. **確認事項**
   - 環境変数（.env）が正しく設定されているか
   - 楽天APIのアプリIDとアフィリエイトIDが設定されているか
   - デバイスがインターネットに接続されているか

3. **よくある原因と対処法**
   - **証明書エラー**: HTTPSの証明書検証でエラーが出る場合があります
   - **タイムアウト**: APIリクエストに時間がかかりすぎている
   - **レート制限**: 楽天APIの呼び出し回数制限に達している

4. **開発ビルドでのデバッグ**
   ```bash
   # 開発ビルドの作成
   npx eas build --platform ios --profile development
   npx eas build --platform android --profile development
   ```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 お問い合わせ

- GitHub Issues: バグ報告・機能要望
- Email: support@stilya.com（仮）

---

© 2025 Stilya Project
