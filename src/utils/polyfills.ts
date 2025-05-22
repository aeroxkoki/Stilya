// URLおよびEventターゲットポリフィル
// Expo環境でのSSR互換性とイベント処理を確保

// URL/Fetchポリフィル（Supabase用）
import 'react-native-url-polyfill/auto';

// Node.js用のグローバルイベントターゲットポリフィル
if (typeof global.EventTarget === 'undefined') {
  (global as any).EventTarget = function () {} as any;
  (global as any).EventTarget.prototype.addEventListener = function () {};
  (global as any).EventTarget.prototype.removeEventListener = function () {};
  (global as any).EventTarget.prototype.dispatchEvent = function () {
    return true;
  };
}

// ストリームポリフィル
global.ReadableStream = global.ReadableStream || function () {};

// 他のポリフィル
if (typeof global.process === 'undefined') {
  global.process = {};
}
if (typeof global.process.nextTick === 'undefined') {
  global.process.nextTick = setTimeout;
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = {
    isBuffer: () => false,
    from: (data) => ({ data }),
  };
}

console.log('🔍 グローバルポリフィルが正常に適用されました');
