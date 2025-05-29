# Node.js v20 インストールガイド

## 🚀 オプション1: Homebrewを使用（推奨・即座に使用可能）

Homebrewが既にインストールされているので、この方法が最も簡単です：

```bash
# 1. 現在のNode.jsのバージョンを確認
node --version

# 2. HomebrewでNode.js v20をインストール
brew install node@20

# 3. Node.js v20をデフォルトに設定
brew unlink node
brew link --overwrite node@20

# 4. バージョンを確認
node --version  # v20.x.xが表示されるはず

# 5. プロジェクトをクリーンアップして再起動
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --clear
```

## 🔧 オプション2: nvmを使用（バージョン管理が必要な場合）

複数のNode.jsバージョンを切り替える必要がある場合：

```bash
# 1. nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. 新しいターミナルウィンドウを開くか、以下を実行
source ~/.zshrc  # または source ~/.bashrc

# 3. Node.js v20をインストール
nvm install 20
nvm use 20
nvm alias default 20

# 4. プロジェクトを再起動
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --clear
```

## ⚠️ トラブルシューティング

### Homebrewでnode@20が見つからない場合
```bash
# Homebrewを更新
brew update

# 利用可能なNodeバージョンを確認
brew search node
```

### nvmが認識されない場合
```bash
# シェルを確認
echo $SHELL

# zshの場合
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# bashの場合
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

## 📋 推奨事項

**Homebrewを使用する方法（オプション1）**を推奨します。理由：
- 即座に使用可能
- 設定が簡単
- Stilyaプロジェクトには単一のNode.jsバージョンで十分

---

どちらの方法でも、Node.js v20をインストール後、Expoプロジェクトが正常に動作するはずです。
