/**
 * expo-modules-core/web のモック
 */

// モジュールをエクスポート
module.exports = {
  // ライフサイクルイベント用エミッター
  EventEmitter: require('../index').EventEmitter,
  
  // その他のモック
  Platform: {
    OS: 'web',
    select: jest.fn(obj => obj.web || obj.default),
  },
  
  // Webエントリーポイント用
  WebEventEmitter: class {
    constructor() {
      this.listeners = {};
    }
    
    addListener(eventName, listener) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(listener);
      return { remove: () => this.removeListener(eventName, listener) };
    }
    
    removeAllListeners() {
      this.listeners = {};
    }
    
    emit(eventName, ...args) {
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(listener => listener(...args));
      }
    }
  },
};
