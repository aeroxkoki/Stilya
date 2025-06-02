// React Native環境用のポリフィル
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

// グローバル設定
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// WebSocketの明示的な設定（React Nativeのグローバルを使用）
if (typeof global.WebSocket === 'undefined' && typeof WebSocket !== 'undefined') {
  global.WebSocket = WebSocket;
}

// Node.jsのprocess.browserをエミュレート
if (typeof process === 'undefined') {
  (global as any).process = { browser: false };
}

console.log('React Native polyfills loaded');
