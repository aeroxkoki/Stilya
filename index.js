// 修正されたExpoエントリポイント
import { registerRootComponent } from 'expo';
import App from './App';

// シリアライザー問題のワークアラウンド
if (global.__BUNDLE_START_TIME__ === undefined) {
  global.__BUNDLE_START_TIME__ = Date.now();
}

// メインコンポーネントを登録
registerRootComponent(App);
