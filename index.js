// React Native/Expo エントリーポイント
import { registerRootComponent } from 'expo';

// Polyfillを最初にロード
import './src/utils/polyfills';

// NativeWindスタイルの初期化
import './src/styles/global.css';

// アプリコンポーネント
import App from './App';

// バンドル時間の初期化（一部の環境で必要）
if (global.__BUNDLE_START_TIME__ === undefined) {
  global.__BUNDLE_START_TIME__ = Date.now();
}

// アプリを登録
registerRootComponent(App);
