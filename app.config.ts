import { ExpoConfig } from 'expo/config';
import appJson from './app.json';

// app.jsonの内容を使用する統合設定
export default (): ExpoConfig => {
  return appJson.expo;
};
