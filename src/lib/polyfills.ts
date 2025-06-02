console.log('[polyfills.ts] 1. ポリフィル読み込み開始');

// React Native環境用のポリフィル
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

console.log('[polyfills.ts] 2. インポート完了');

// グローバル設定
if (typeof global.Buffer === 'undefined') {
  console.log('[polyfills.ts] 3. Buffer設定');
  global.Buffer = Buffer;
}

// WebSocketの明示的な設定（React Nativeのグローバルを使用）
if (typeof global.WebSocket === 'undefined' && typeof WebSocket !== 'undefined') {
  console.log('[polyfills.ts] 4. WebSocket設定');
  global.WebSocket = WebSocket;
}

// Node.jsのprocess.browserをエミュレート
if (typeof process === 'undefined') {
  console.log('[polyfills.ts] 5. process設定');
  (global as any).process = { browser: false };
}

console.log('[polyfills.ts] 6. React Native polyfills loaded');
console.log('[polyfills.ts] グローバル確認:', {
  Buffer: typeof global.Buffer,
  WebSocket: typeof global.WebSocket,
  process: typeof process
});
