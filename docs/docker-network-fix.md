# Docker Desktop ネットワーク設定の調整手順

## 🔍 現在の問題

Docker Desktopにプロキシが設定されており、Supabaseのイメージがダウンロードできない状態です。

```
エラー: Error response from daemon: Get "https://public.ecr.aws/v2/": 
rejecting public.ecr.aws:443 because traffic from evaluating PAC file
```

## 🛠️ 解決手順

### 方法1: Docker Desktop GUI経由での設定変更（推奨）

1. **Docker Desktopを開く**
   - メニューバーのDockerアイコンをクリック
   - "Dashboard"または"Settings"を選択

2. **設定画面に移動**
   - 左側メニューから「Settings」または「Preferences」をクリック
   - 「Resources」→「Proxies」を選択

3. **プロキシ設定を無効化**
   - 「Manual proxy configuration」のチェックを外す
   - または「Use system proxy」のチェックも外す
   - 「Apply & restart」をクリック

4. **Docker Desktopが再起動するのを待つ**
   - 通常1-2分程度かかります

### 方法2: コマンドラインでの設定変更

```bash
# 1. Docker Desktopを停止
osascript -e 'quit app "Docker"'

# 2. 設定ファイルを編集
cp ~/.docker/config.json ~/.docker/config.json.backup
echo '{
  "auths": {},
  "credsStore": "desktop",
  "currentContext": "desktop-linux"
}' > ~/.docker/config.json

# 3. Docker Desktopを再起動
open -a Docker
```

### 方法3: 一時的な回避策

```bash
# プロキシを回避してSupabaseを起動
cd /Users/koki_air/Documents/GitHub/Stilya
./scripts/start-supabase-no-proxy.sh
```

## ✅ 設定変更後の確認

1. **Dockerの接続テスト**
   ```bash
   docker pull hello-world
   ```
   
   成功時の出力:
   ```
   Using default tag: latest
   latest: Pulling from library/hello-world
   ...
   Status: Downloaded newer image for hello-world:latest
   ```

2. **Supabaseの起動**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   npm run supabase:start
   ```

## 🚨 トラブルシューティング

### プロキシ設定が必要な環境の場合

会社のネットワークなどでプロキシが必要な場合：

1. **Docker Desktop設定で正しいプロキシを設定**
   - HTTP Proxy: `http://your-proxy:port`
   - HTTPS Proxy: `http://your-proxy:port`
   - No Proxy: `localhost,127.0.0.1,*.local,host.docker.internal`

2. **ミラーリポジトリを使用**
   Docker Desktop設定の「Docker Engine」タブで：
   ```json
   {
     "registry-mirrors": [
       "https://mirror.gcr.io"
     ]
   }
   ```

### それでも解決しない場合

1. **Docker Desktopの完全リセット**
   - Settings → Troubleshoot → Reset to factory defaults

2. **手動でイメージをダウンロード**
   ```bash
   # 別のマシンでイメージをエクスポート
   docker save supabase/postgres:15.8.1.085 > postgres.tar
   
   # このマシンでインポート
   docker load < postgres.tar
   ```

## 📝 現在の状態

- Docker Desktop: ✅ インストール済み・稼働中
- Supabase CLI: ✅ インストール済み
- プロジェクト設定: ✅ 完了
- **ネットワーク設定: ⚠️ プロキシ設定の調整が必要**

プロキシ設定を無効化または正しく設定すれば、Supabaseローカル環境が起動できます。