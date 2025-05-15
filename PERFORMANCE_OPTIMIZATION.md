# パフォーマンス最適化のための追加パッケージ

Day35のパフォーマンスチューニング実装で追加された機能を完全に活用するためには、以下のnpmパッケージをインストールする必要があります。以下のコマンドでインストールしてください：

```bash
npm install --save-dev babel-plugin-transform-remove-console babel-plugin-transform-remove-debugger
```

これらのパッケージは、babel.config.jsに追加されている次の最適化プラグインに対応するものです：
- `transform-remove-console`: 本番環境でのコンソールログを削除（デバッグと警告、エラーは残す）
- `transform-remove-debugger`: 本番環境でのデバッガーステートメントを削除

## Expo Hermes エンジンを有効化

また、app.jsonに`"jsEngine": "hermes"`が追加されています。これは高速化のためのJavaScriptエンジンです。Hermesのサポートは追加設定なしでも動作しますが、下記のコマンドで最新のExpo SDKに対応していることを確認してください：

```bash
expo upgrade
```

## 他の最適化対策

アプリケーションにすでに実装済みの最適化対策：

1. CachedImageコンポーネント - 画像キャッシュとロード最適化
2. 不要なデータのメモリ解放の自動化
3. JavaScript側でのパフォーマンスモニタリング
4. アプリライフサイクルに応じたメモリ管理
5. スワイプUIのアニメーションパフォーマンス最適化
6. useCallback, useMemo, React.memoによるレンダリング最適化

## 注意事項

- 本番ビルド前に `eas build --platform ios` または `eas build --platform android` コマンドで動作確認を行ってください
- プロダクションビルドとデベロップメントビルドでパフォーマンスに大きな差があります
- Hermes有効時は、デバッグが若干異なる動作をする場合があります
