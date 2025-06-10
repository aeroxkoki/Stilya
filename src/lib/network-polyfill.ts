// React Native用のネットワーク設定とpolyfills
import 'react-native-url-polyfill/auto';

// 基本的なネットワーク設定
export const configureNetwork = () => {
  // React Native特有の設定
  if (__DEV__) {
    console.log('[Network] React Native network configuration applied');
  }
};
