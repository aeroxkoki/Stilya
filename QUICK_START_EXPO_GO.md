# Stilya 開発クイックスタートガイド

## 現在の開発環境の状態

### ✅ 完了済み
- React Native (Expo SDK 53) プロジェクトのセットアップ
- TypeScript環境の構築
- Supabase統合
- iOSネイティブプロジェクトの生成（prebuild完了）
- CocoaPods依存関係のインストール
- 環境変数設定（UTF-8エンコーディング）

### ❌ 未完了
- iOSシミュレーターのインストール

## 推奨開発方法: Expo Goアプリ

iOSシミュレーターが未インストールのため、**Expo Go**アプリを使用した開発を推奨します。

### 手順

#### 1. iPhoneにExpo Goをインストール
- App Storeで「Expo Go」を検索
- インストールして開く

#### 2. 開発サーバーを起動
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm start
```

#### 3. アプリを起動
以下のいずれかの方法でアプリを開きます：

**方法A: QRコード**
- ターミナルに表示されるQRコードをiPhoneのカメラでスキャン
- 「Expo Goで開く」を選択

**方法B: 手動入力**
- Expo Goアプリを開く
- 「Enter URL manually」を選択
- ターミナルに表示されるURL（例: `exp://192.168.x.x:8081`）を入力

### トラブルシューティング

#### QRコードが表示されない場合
```bash
# QRコードを再表示
npx expo start --tunnel
```

#### 接続できない場合
1. MacとiPhoneが同じWi-Fiネットワークに接続されているか確認
2. ファイアウォール設定を確認
3. `--tunnel`オプションを使用：
   ```bash
   npx expo start --tunnel
   ```

## その他の開発オプション

### 1. iOSシミュレーターをインストール
詳細は[iOS_SIMULATOR_SETUP.md](./IOS_SIMULATOR_SETUP.md)を参照

### 2. EAS Buildを使用
```bash
# 開発用ビルドを作成
eas build --platform ios --profile development
```

### 3. 実機での直接ビルド
```bash
# iPhoneを接続して実行
npm run ios --device
```

## 開発のヒント

### ホットリロード
- Expo Goアプリ内で、シェイクジェスチャーまたは「⌘D」でデベロッパーメニューを開く
- 「Fast Refresh」を有効にして、コード変更を即座に反映

### デバッグ
- `console.log()`でデバッグ情報を出力
- React Developer Toolsを使用してコンポーネントを検査

### パフォーマンス
- 開発中は`__DEV__`モードで実行されるため、本番環境より遅い
- パフォーマンステストは本番ビルドで行う

## よくある質問

### Q: Expo Goでは使えない機能はありますか？
A: カスタムネイティブモジュールは使用できません。MVP段階では問題ありません。

### Q: 本番環境でもExpo Goを使いますか？
A: いいえ、本番環境ではEAS BuildまたはXcodeでビルドしたスタンドアロンアプリを使用します。

### Q: デモモードとは何ですか？
A: Supabaseに接続せずにモックデータで動作するモードです。インターネット接続なしでも開発できます。

## サポート

問題が発生した場合：
1. [MVP_STATUS.md](./MVP_STATUS.md)を確認
2. GitHubのIssueを作成
3. エラーメッセージとスクリーンショットを添付

---

Happy Coding! 🚀
