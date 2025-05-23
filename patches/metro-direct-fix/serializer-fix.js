/**
 * Metroシリアライザーの直接修正
 * expo export:embedでJSONフォーマットエラーを修正
 */

// オリジナルのシリアライザーをロード
const metro = require('metro');
const path = require('path');

// 修正したシリアライザーを作成
function createFixedSerializer() {
  // デフォルトシリアライザーの取得を試みる
  const originalSerializers = (() => {
    try {
      if (typeof metro.createDefaultSerializers === 'function') {
        return metro.createDefaultSerializers();
      }
    } catch (e) {}
    
    // フォールバック: 基本的なシリアライザーを作成
    return {
      json: {
        stringify: JSON.stringify
      },
      bundle: {
        stringify: (x) => x
      }
    };
  })();
  
  // JSONシリアライザーを修正
  const fixedJsonSerializer = {
    ...originalSerializers.json,
    stringify: (data) => {
      try {
        // JavaScript変数宣言文字列をJSONに変換
        if (typeof data === 'string' && data.startsWith('var __')) {
          return JSON.stringify({
            code: data,
            map: null,
            dependencies: []
          });
        }
        
        // 通常のJSON文字列化
        if (typeof data === 'object') {
          return JSON.stringify(data);
        }
        
        // その他のケース
        return JSON.stringify({
          code: String(data),
          map: null,
          dependencies: []
        });
      } catch (e) {
        console.error('シリアライザーエラー:', e);
        return JSON.stringify({
          code: String(data),
          error: String(e),
          dependencies: []
        });
      }
    }
  };
  
  return {
    ...originalSerializers,
    json: fixedJsonSerializer
  };
}

module.exports = createFixedSerializer;
