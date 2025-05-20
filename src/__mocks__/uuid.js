/**
 * uuidモジュールのモック実装
 * Jest-expo環境で使用
 */

const uuidv4 = () => {
  // 簡易的なUUID v4モック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// モジュールエクスポート
module.exports = {
  v1: uuidv4,
  v3: uuidv4,
  v4: uuidv4,
  v5: uuidv4,
  NIL: '00000000-0000-0000-0000-000000000000',
  version: () => 4,
  validate: () => true,
  parse: () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  stringify: (arr) => uuidv4(),
  // デフォルトエクスポート
  default: {
    v1: uuidv4,
    v3: uuidv4,
    v4: uuidv4,
    v5: uuidv4,
  }
};
