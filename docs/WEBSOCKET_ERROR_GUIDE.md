# WebSocket と Node.js モジュールエラー対応ガイド

## 問題の概要

React Native/Expo環境では、Node.js のコアモジュール（`stream`, `buffer`, `crypto`など）が利用できません。
`ws`パッケージなどNode.js用のWebSocketライブラリを使用しようとすると、以下のようなエラーが発生します：

```
Unable to resolve module stream from node_modules/ws/lib/stream.js
```

## 解決済み

このエラーは `metro.config.js` の設定により解決されています。

### 実装済みの解決策

#### 1. Metro設定でwsモジュールをスキップ ✅

`metro.config.js` でwsモジュールを空モジュールとして解決：

```javascript
// WebSocketエラーを解消するための設定
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // wsモジュールを空モジュールとして解決
    if (moduleName === 'ws') {
      return { type: 'empty' };
    }
    // デフォルトの解決方法を使用
    return context.resolveRequest(context, moduleName, platform);
  },
};
```

#### 2. Supabase クライアントの設定 ✅

`src/services/supabase.ts` でReact Native用のWebSocketアダプターを実装済み：

```typescript
// React Native環境用のWebSocketアダプター
class ReactNativeWebSocketAdapter {
  constructor(url: string, protocols?: string | string[]) {
    return new WebSocket(url, protocols);
  }
}

// Supabaseクライアント設定
realtime: {
  WebSocket: ReactNativeWebSocketAdapter as any,
}
```

#### 3. ポリフィルの設定 ✅

`src/lib/polyfills.ts` でURL polyfillを適用：

```typescript
import 'react-native-url-polyfill/auto';
```

#### 4. App.tsx での初期化 ✅

ポリフィルは必ず最初にインポート：

```typescript
// Polyfills must be imported first
import './src/lib/polyfills';
```

## 必要なパッケージ

開発依存関係として以下をインストール：

```bash
npm install stream-browserify buffer --save-dev
```

## トラブルシューティング

1. **キャッシュのクリア**
   ```bash
   npx expo start --clear
   ```

2. **node_modules の再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Expoプロセスの再起動**
   - 既存のExpoプロセスを停止してから再起動

## 注意事項

- Expo Managed Workflow の互換性を維持するため、ネイティブモジュールの直接使用は避ける
- React Native のグローバルWebSocket実装を優先的に使用
- Node.js専用パッケージの使用は最小限に抑える

## 更新履歴

- 2025年6月3日: metro.config.js に resolver 設定を追加し、WebSocketエラーを解決
