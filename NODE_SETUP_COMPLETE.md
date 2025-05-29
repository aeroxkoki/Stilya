# Stilya MVP - Node.js環境セットアップ完了

## ✅ 実施内容

### 1. Node.js v20.18.1への切り替え成功
- **nodebrew**を使用してNode.js v20.18.1をインストール
- v23.10.0からv20.18.1へダウングレード完了

### 2. 依存関係の再インストール完了
- 885パッケージを正常にインストール
- Node.js v20との互換性を確保

## 🚀 Expoプロジェクトの起動方法

### オプション1: 簡単な起動方法（推奨）
```bash
# ターミナルで以下を実行
cd /Users/koki_air/Documents/GitHub/Stilya
export PATH=$HOME/.nodebrew/current/bin:$PATH
npx expo start
```

### オプション2: パスを永続的に設定
```bash
# 1. シェルの設定ファイルを編集
echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 2. Expoを起動
cd /Users/koki_air/Documents/GitHub/Stilya
npx expo start
```

## 📱 開発の進め方

1. **Expo Goアプリ**をスマートフォンにインストール
2. `npx expo start`を実行
3. 表示されるQRコードをスキャン
4. アプリが起動することを確認

## 🔧 トラブルシューティング

### エラーが発生する場合
```bash
# キャッシュをクリア
rm -rf .expo node_modules/.cache
npx expo start --clear
```

### パスが正しく設定されていない場合
```bash
# 現在使用中のNode.jsバージョンを確認
$HOME/.nodebrew/current/bin/node --version
# v20.18.1が表示されるはず
```

## 📝 次のステップ

1. **基本機能の実装**
   - スワイプUI
   - 商品表示
   - Supabase連携

2. **GitHub Actionsの設定**
   - ローカルビルドが成功したら、CI/CDを設定

---

Node.js v20への切り替えが完了しました。`export PATH=$HOME/.nodebrew/current/bin:$PATH`を実行後、`npx expo start`でプロジェクトを起動してください。
