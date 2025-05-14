# Node.js LTS バージョンへのダウングレード手順

この文書では、Node.js v23.10.0 から LTS バージョン (v20.x) へのダウングレード手順を説明します。これにより、Stilya プロジェクトを安定的に動作させることができます。

## 方法 1: NVM（Node Version Manager）を使用する方法

NVM は複数の Node.js バージョンを管理するためのツールで、簡単に異なるバージョンを切り替えることができます。

### 手順

1. **ターミナルを開き、以下のコマンドで NVM をインストール**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

2. **インストール後、新しいターミナルを開くか、設定ファイルを再読み込み**:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
```

3. **Node.js LTS バージョンをインストール**:

```bash
nvm install --lts
```

4. **LTS バージョンを使用するように設定**:

```bash
nvm use --lts
```

5. **デフォルトを LTS に設定**:

```bash
nvm alias default lts/*
```

6. **インストールの確認**:

```bash
node -v
```

出力が `v20.x.x` のように表示されれば成功です。

7. **Stilya プロジェクトの依存関係を再インストール**:

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf node_modules
rm package-lock.json
npm install
```

## 方法 2: 公式インストーラーを使用する方法

NVM を使用したくない場合は、Node.js の公式サイトから LTS バージョンをダウンロードしてインストールすることもできます。

### 手順

1. [Node.js 公式サイト](https://nodejs.org/) にアクセス

2. LTS バージョン（推奨）をダウンロード

3. インストーラーを実行し、画面の指示に従ってインストール

4. インストール完了後、ターミナルを開き、以下のコマンドでバージョンを確認:

```bash
node -v
```

5. Stilya プロジェクトの依存関係を再インストール:

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf node_modules
rm package-lock.json
npm install
```

## 方法 3: シンプルインストーラーを使用する方法

より簡単な方法として、このリポジトリに含まれる `install-node-lts.sh` スクリプトを使用することもできます。

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
./install-node-lts.sh
```

このスクリプトは自動的に NVM をインストールし、Node.js LTS バージョンを設定します。

## Node.js のダウングレード後

Node.js のバージョンを変更した後、以下のコマンドでプロジェクトを起動してください：

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm start
```

## トラブルシューティング

1. **NVM インストール後に `nvm` コマンドが見つからない場合**:
   
   ターミナルを再起動するか、以下のコマンドを実行してください：
   
   ```bash
   source ~/.zshrc  # ZSH を使用している場合
   # または
   source ~/.bash_profile  # Bash を使用している場合
   ```

2. **インストールエラーが発生する場合**:
   
   管理者権限が必要な場合があります。`sudo` をコマンドの前に付けて試してください：
   
   ```bash
   sudo npm install -g n
   sudo n lts
   ```

3. **その他の問題**:
   
   公式サイトから直接ダウンロードして、手動でインストールすることをお勧めします：
   https://nodejs.org/ja/download/
