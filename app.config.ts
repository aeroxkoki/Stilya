import { ExpoConfig, ConfigContext } from 'expo/config';

// シンプルな設定ファイル
export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'Stilya',
  slug: 'stilya',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  owner: 'aeroxkoki', // GitHub Actionsで使用するowner
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.stilya.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.stilya.app'
  },
  web: {
    favicon: './assets/icon.png'
  },
  extra: {
    eas: {
      // プロジェクトIDは自動生成されるため削除
    }
  }
});
