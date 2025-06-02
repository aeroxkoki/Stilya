// React Native Reanimatedを最初に初期化
import 'react-native-reanimated';

// Expoのデフォルトエントリーポイント
import { registerRootComponent } from 'expo';

// App.tsxをインポート
import App from './App';

// アプリを登録
registerRootComponent(App);
