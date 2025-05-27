# Stilya MVP iOS開発ガイド

## 🎯 MVP開発環境セットアップ（更新版）

### 現在の状態

- ✅ **Expo Managed Workflow** (SDK 53) で構築
- ✅ **TypeScript** + **React Native** で開発
- ✅ **Supabase** をバックエンドとして使用
- ✅ **iOSローカルビルド** 環境整備済み

### 📱 iOS開発の始め方

#### 1. 環境診断

まず、開発環境が正しく設定されているか確認します：

```bash
./check-ios-mvp.sh
```

#### 2. 依存関係のインストール

```bash
npm install
```

#### 3. 環境変数の設定

`.env` ファイルをセットアップ：

```bash
cp .env.example .env
# .envファイルを編集して実際の値を設定
```

#### 4. iOS開発サーバーの起動

**方法1: スクリプトを使用（推奨）**
```bash
./start-ios-local.sh
```

**方法2: Expo CLIを直接使用**
```bash
npm run start:ios
```

**方法3: Expo Goでテスト**
```bash
npm start
# QRコードをiPhoneのExpo Goアプリでスキャン
```

### 🏗️ プロジェクト構造

```
Stilya/
├── src/                    # ソースコード
│   ├── components/         # UIコンポーネント
│   ├── screens/           # 画面コンポーネント
│   ├── navigation/        # ナビゲーション設定
│   ├── services/          # API・ビジネスロジック
│   ├── hooks/             # カスタムフック
│   ├── store/             # 状態管理
│   └── utils/             # ユーティリティ
├── assets/                # 画像・アイコン
├── app.config.js          # Expo設定
├── package.json           # 依存関係
└── tsconfig.json          # TypeScript設定
```

### 🔧 開発のヒント

#### デバッグ

1. **React Native Debugger** を使用
2. **console.log** でデバッグ出力
3. **Expo DevTools** でログを確認

#### ホットリロード

- コードを保存すると自動的にリロード
- 手動リロード: `Cmd + R` (シミュレーター内)

#### キャッシュクリア

問題が発生した場合：

```bash
./start-ios-local.sh --clean
# または
npm run clean
```

### 📝 MVP機能チェックリスト

- [ ] ユーザー認証（メール）
- [ ] スワイプUI（Yes/No）
- [ ] 商品表示（画像・価格・ブランド）
- [ ] 好み学習（タグベース）
- [ ] おすすめ表示
- [ ] 商品詳細・外部リンク
- [ ] 履歴表示

### 🚀 次のステップ

1. **実機テスト**: Expo Goアプリで実機テスト
2. **開発ビルド**: EAS Buildで開発用ビルドを作成
3. **本番ビルド**: App Store用のビルドを準備

### ⚠️ 注意事項

- **Managed Workflow** を維持（ネイティブコード不要）
- **環境変数** にダミー値を使用している場合は実際の値に変更
- **Supabase** の設定が必要（プロジェクト作成・API key取得）

### 🆘 トラブルシューティング

#### シミュレーターが起動しない
```bash
# Xcodeを開いて利用規約に同意
sudo xcode-select -s /Applications/Xcode.app
```

#### Metro bundlerエラー
```bash
# キャッシュをクリア
npx expo start --clear
```

#### 依存関係エラー
```bash
# node_modulesを再インストール
rm -rf node_modules
npm install
```

---

更新日: 2025年5月26日
