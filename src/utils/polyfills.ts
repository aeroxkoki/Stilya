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
if (typeof global.ReadableStream === 'undefined') {
  (global as any).ReadableStream = function () {} as any;
}

// 他のポリフィル
if (typeof global.process === 'undefined') {
  (global as any).process = {};
}
if (typeof global.process.nextTick === 'undefined') {
  (global as any).process.nextTick = setTimeout;
}

if (typeof global.Buffer === 'undefined') {
  (global as any).Buffer = {
    isBuffer: () => false,
    from: (data: any) => ({ data }),
  };
}

console.log('🔍 グローバルポリフィルが正常に適用されました');
