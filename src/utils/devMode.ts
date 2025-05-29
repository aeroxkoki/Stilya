import Constants from 'expo-constants';

/**
 * 開発機能が有効かどうかを判定
 */
export const isDevMode = (): boolean => {
  // expo-constants から extra 設定を取得
  const enableDevFeatures = Constants.expoConfig?.extra?.enableDevFeatures;
  
  // 開発モードの判定
  return __DEV__ || enableDevFeatures === true;
};

/**
 * 開発環境でのみ実行する関数
 */
export const devOnly = <T>(callback: () => T, fallback?: T): T | undefined => {
  if (isDevMode()) {
    return callback();
  }
  return fallback;
};

/**
 * 本番環境でのみ実行する関数
 */
export const prodOnly = <T>(callback: () => T, fallback?: T): T | undefined => {
  if (!isDevMode()) {
    return callback();
  }
  return fallback;
};

/**
 * 環境に応じた値を返す
 */
export const getEnvValue = <T>(devValue: T, prodValue: T): T => {
  return isDevMode() ? devValue : prodValue;
};

/**
 * 開発用ログ出力
 */
export const devLog = (...args: any[]): void => {
  if (isDevMode()) {
    console.log('[DEV]', ...args);
  }
};

/**
 * 開発用警告出力
 */
export const devWarn = (...args: any[]): void => {
  if (isDevMode()) {
    console.warn('[DEV]', ...args);
  }
};

/**
 * 開発用エラー出力
 */
export const devError = (...args: any[]): void => {
  if (isDevMode()) {
    console.error('[DEV]', ...args);
  }
};
