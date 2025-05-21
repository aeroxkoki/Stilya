// ExpoのJSON解析エラーに対処するための修正版エントリーポイント
import { registerRootComponent } from 'expo';
import './src/utils/polyfills'; // グローバルポリフィルを最初にロード
import App from './App';

// JSONパーサーパッチをロード（できるだけ早く）
import './patches/expo-monkey-patch/json-serializer-patch';

// バンドル時間の初期化（一部の環境で必要）
if (global.__BUNDLE_START_TIME__ === undefined) {
  global.__BUNDLE_START_TIME__ = Date.now();
}

// アプリを登録
registerRootComponent(App);
