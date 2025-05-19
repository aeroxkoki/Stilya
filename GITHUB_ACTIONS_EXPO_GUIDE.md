# GitHub Actions × Expo EAS ビルドトラブルシューティングガイド

このドキュメントは、GitHub ActionsでのExpo EASビルド実行時に発生する可能性のあるMetro/Babel関連の問題を解決するためのガイドです。

## 実装済みの修正点

以下の修正をプロジェクトに適用して、GitHub Actions環境でのビルド安定性を向上させました：

1. **babel.config.jsの簡素化**
   - 余分なプラグインや条件分岐を削除し、最小限の設定にしました
   - `react-native-reanimated/plugin`のみを使用し、複雑なエイリアス設定を削除

2. **metro.config.jsの最適化**
   - packageExportsフィールドをオプトアウト（互換性問題回避のため）
   - シンプルな設定を維持し、複雑なresolverやtransformerの設定を避けました

3. **Node.jsバージョンの更新**
   - すべての環境でNode.js 20を使用するように修正（Expo SDK 53の推奨）
   - GitHub Actionsワークフローで統一的にNode 20を使用

4. **EASビルド設定の最適化**
   - `EAS_SKIP_JAVASCRIPT_BUNDLING=1`フラグを確実に設定
   - キャッシュクリア手順を追加

5. **依存関係バージョンの固定**
   - Metro、Babel関連のパッケージバージョンを明示的に固定
   - `fix-metro-dependencies.sh`スクリプトで必要なパッケージを自動インストール

## トラブルシューティング

ビルドに問題が発生した場合は、以下の手順を試してください：

1. **ローカルでのテスト**
   ```bash
   # キャッシュをクリアしてテストビルドを実行
   npm run clean
   chmod +x ./scripts/test-build-fixes.sh
   ./scripts/test-build-fixes.sh
   ```

2. **エラー別の対応策**
   - `Error: Serializer did not return expected format` → Metro依存関係のバージョン不一致
     - `npm run fix-metro`を実行してください
   - `SyntaxError: Unexpected token 'v', "var __BUND"...` → バンドル処理の問題
     - `EAS_SKIP_JAVASCRIPT_BUNDLING=1`フラグが設定されているか確認
     - Babel設定を簡素化
   - New Architecture関連のエラー → オプトアウト設定を確認

3. **最終的な解決策**
   - 依存関係のクリーンインストール
     ```bash
     rm -rf node_modules
     npm ci
     npm run fix-metro
     ```
   - プロジェクトの完全なリフレッシュ
     ```bash
     rm -rf node_modules .expo .metro-cache
     npm ci
     npx expo start -c
     ```

## GitHub Actionsでの注意点

- バージョン競合の可能性を減らすため、依存関係は`npm ci`でインストール
- キャッシュを部分的にクリアするステップを各ビルド前に実行
- `EAS_SKIP_JAVASCRIPT_BUNDLING=1`環境変数を必ず設定
- 特に重いタスクでは`NODE_OPTIONS="--max-old-space-size=4096"`を設定

## より詳細な情報

問題が解決しない場合は、以下の情報を確認してください：
- [Expo SDK 53 リリースノート](https://docs.expo.dev/workflow/upgrading/)
- [EAS Build ドキュメント](https://docs.expo.dev/build/introduction/)
- [React Native CI/CD ガイド](https://reactnative.dev/docs/next/ci-cd)
