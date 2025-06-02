# WebSocket と Node.js モジュールエラー対応ガイド

## 問題の概要

React Native/Expo環境では、Node.js のコアモジュール（`stream`, `buffer`, `crypto`など）が利用できません。
`ws`パッケージなどNode.js用のWebSocketライブラリを使用しようとすると、以下のようなエラーが発生します：

```
Unable to resolve module stream from node_modules/ws/lib/stream.js
```

## 解決策

### 1. Supabase クライアントの設定更新

`src/services/supabase.ts` でReact Native用のWebSocketアダプターを実装：

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

### 2. Metro設定の更新

`metro.config.js` でwsモジュールをスキップ：

```javascript
resolveRequest: (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
}
```

### 3. ポリフィルの設定

`src/lib/polyfills.ts` でグローバル設定：

```typescript
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
```

### 4. App.tsx での初期化

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
