# Stilya プロジェクトビルドスクリプト

このディレクトリには、プロジェクトのビルドとテストに関連するスクリプトが含まれています。

## CI/CD環境向けのスクリプト

### fix-patches-for-ci.sh

GitHub Actions などの CI 環境で patch-package の問題を修正するスクリプトです。
パッチファイルが存在しない場合やパース問題がある場合に、有効なダミーパッチファイルを作成します。

使い方:
```bash
chmod +x ./scripts/fix-patches-for-ci.sh
./scripts/fix-patches-for-ci.sh
```

### ci-build-fix.sh

CI環境でのビルド問題を総合的に修正するスクリプトです。
- patches ディレクトリと有効なパッチファイルの作成
- package.json の postinstall スクリプトの一時的な修正
- Metro 設定の確認

使い方:
```bash
chmod +x ./scripts/ci-build-fix.sh
./scripts/ci-build-fix.sh
```

## 環境構築スクリプト

### fix-metro-dependencies.sh

Metro と Babel の依存関係を修正するスクリプトです。

使い方:
```bash
sh ./scripts/fix-metro-dependencies.sh
```

### direct-eas-build.sh

EAS ビルドを直接実行するスクリプトです。

使い方:
```bash
chmod +x ./scripts/direct-eas-build.sh
./scripts/direct-eas-build.sh
```

## トラブルシューティング

もし GitHub Actions でビルドに問題がある場合は、以下の手順を試してください：

1. `scripts/ci-build-fix.sh` を実行してみる
2. package.json の postinstall スクリプトからパッチ適用部分を一時的に削除して試す
3. `patches` ディレクトリの内容を確認する
