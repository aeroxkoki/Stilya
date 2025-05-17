/**
 * Expoのシリアライズエラーを修正するためのグローバルパッチ
 * こちらは緊急措置用であり、metro.config.jsの設定が優先されます
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
    // シリアライズエラー対応
    if (e instanceof SyntaxError && typeof text === 'string') {
      console.warn('[Expo Patch] JSON構文エラー - フォールバック処理を実行します:', e.message);
      
      // フォールバック: JavaScriptコードとして扱う
      return {
        code: String(text),
        map: null,
        dependencies: []
      };
    }
    
    // その他のエラーは再スロー
    throw e;
  }
};

// オリジナルのJSONストリンギファイを保存
const originalJSONStringify = JSON.stringify;

// JSONのストリンギファイ処理もパッチ
JSON.stringify = function(value, ...args) {
  try {
    // 通常のストリンギファイを試す
    return originalJSONStringify(value, ...args);
  } catch (e) {
    console.warn('[Expo Patch] JSONストリンギファイエラー - フォールバック処理を実行します:', e.message);
    
    // フォールバック: シンプルなオブジェクトに変換
    if (typeof value === 'string') {
      // 文字列の場合はコードとして扱う
      return originalJSONStringify({
        code: value,
        map: null,
        dependencies: []
      }, ...args);
    } else {
      // その他の場合は空のオブジェクトを返す
      return originalJSONStringify({
        code: "",
        map: null,
        dependencies: []
      }, ...args);
    }
  }
};

// パッチが適用されたことを通知
console.log('[Expo Patch] JSONパーサー/ストリンギファイが正常にパッチされました');
