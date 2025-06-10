// React Native環境用のポリフィル
// Supabase用のURL polyfillのみを適用
import 'react-native-url-polyfill/auto';

// ネットワーク設定（開発ビルド用）
import './network-polyfill';

// グローバルオブジェクトの操作は最小限にし、Expo Goとの競合を避ける
