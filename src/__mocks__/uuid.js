/**
 * uuidモジュールのモック実装
 * Jest-expo環境で使用
 * 
 * - jest-expoのsetup.jsで発生するuuid重複宣言問題に対応
 * - ESMとCJSの両方のインポート形式をサポート
 * - Expo SDK 53 / React Native 0.79に対応
 */

// ベースUUID実装
const generateV4 = () => {
  // 簡易的なUUID v4モック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// モジュールエクスポート - CommonJS形式
const uuidExports = {
  v1: generateV4,  // 全てのバージョンでV4を返す
  v3: generateV4,
  v4: generateV4,
  v5: generateV4,
  NIL: '00000000-0000-0000-0000-000000000000',
  version: () => 4,
  validate: () => true,
  parse: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  stringify: () => generateV4(),
  
  // ESM デフォルトエクスポート互換
  default: {
    v1: generateV4,
    v3: generateV4,
    v4: generateV4,
    v5: generateV4,
    NIL: '00000000-0000-0000-0000-000000000000',
    version: () => 4,
    validate: () => true,
    parse: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    stringify: () => generateV4(),
  }
};

// ESモジュール対応の設定
Object.defineProperty(uuidExports, '__esModule', { value: true });

// デフォルトエクスポートとしても使えるように
uuidExports.default.default = uuidExports.default;

module.exports = uuidExports;
