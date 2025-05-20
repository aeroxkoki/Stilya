/**
 * expo-modules-coreのモック
 * Jest環境で必要なモックオブジェクトを提供
 */

// EventEmitterのモック実装
class EventEmitter {
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

  removeListener(eventName, listener) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(l => l !== listener);
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {};
    }
  }

  emit(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(listener => {
        listener(...args);
      });
    }
  }
}

// NativeModuleのモック
class NativeModule {
  constructor(name) {
    this.name = name;
  }
}

// SharedObjectのモック
class SharedObject {
  constructor(id) {
    this.id = id;
  }
}

// モックオブジェクトをエクスポート
module.exports = {
  EventEmitter,
  NativeModule,
  SharedObject,
  // その他の必要なモック
  requireOptional: jest.fn(() => null),
  Platform: {
    OS: 'ios',
    UIImplementation: null,
  },
  ExponentConstants: {
    statusBarHeight: 42,
    deviceId: 'mock-device-id',
    installationId: 'mock-installation-id',
  },
  // expo-firebaseモック
  Firebase: {
    firebaseConfig: null,
    apps: [],
  },
  // DevMenuManagerのモック
  DevMenuManager: {
    openMenu: jest.fn(),
    closeMenu: jest.fn(),
    isMenuOpen: false,
  },
  UtilManager: {
    reload: jest.fn(),
  },
};
