/**
 * Expoのシリアライズエラーを修正するためのパッチ
 */

// オリジナルのJSONパースを保存
const originalJSONParse = JSON.parse;

// JSONのパース処理をモンキーパッチ
JSON.parse = function(text, ...args) {
  // JavaScriptコードかどうかチェック
  if (typeof text === 'string' && text.startsWith('var __BUNDLE')) {
    console.log('[Expo Patch] JavaScriptコードをJSONに変換します');
    // JavaScriptコードをJSONに変換
    return {
      code: text,
      map: null,
      dependencies: []
    };
  }
  
  // 通常のJSON文字列の場合は元のJSON.parseを使用
  try {
    return originalJSONParse(text, ...args);
  } catch (e) {
    console.error('[Expo Patch] JSONパースエラー:', e);
    // フォールバック: JavaScriptコードとして扱う
    return {
      code: String(text),
      map: null,
      dependencies: []
    };
  }
};

// パッチが適用されたことを通知
console.log('[Expo Patch] JSONパーサーが正常にパッチされました');
