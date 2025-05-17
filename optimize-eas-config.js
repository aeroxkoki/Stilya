/**
 * EAS設定を調整するスクリプト
 * GitHub Actions環境でexpo export:embedの問題を解決
 */
const fs = require('fs');
const path = require('path');

// 色付きログ
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
};

// app.jsonとeas.jsonのパス
const appJsonPath = path.join(process.cwd(), 'app.json');
const easJsonPath = path.join(process.cwd(), 'eas.json');

// app.jsonの読み込みと更新
const updateAppJson = () => {
  log.info('app.jsonを更新しています...');
  
  try {
    const appJson = require(appJsonPath);
    
    // バックアップを作成
    fs.writeFileSync(`${appJsonPath}.backup`, JSON.stringify(appJson, null, 2));
    
    // Android設定の調整
    if (!appJson.expo.android) {
      appJson.expo.android = {};
    }
    
    // JVM引数の追加（メモリを増やす）
    appJson.expo.android.jsEngine = 'hermes';
    
    // iOS設定の調整
    if (!appJson.expo.ios) {
      appJson.expo.ios = {};
    }
    
    appJson.expo.ios.jsEngine = 'hermes';
    
    // 更新したapp.jsonを保存
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    log.success('app.jsonを更新しました');
    return true;
  } catch (error) {
    log.error(`app.jsonの更新に失敗しました: ${error.message}`);
    return false;
  }
};

// eas.jsonの読み込みと更新
const updateEasJson = () => {
  log.info('eas.jsonを更新しています...');
  
  try {
    const easJson = require(easJsonPath);
    
    // バックアップを作成
    fs.writeFileSync(`${easJsonPath}.backup`, JSON.stringify(easJson, null, 2));
    
    // CI環境設定の調整
    if (!easJson.build.ci) {
      easJson.build.ci = {};
    }
    
    if (!easJson.build.ci.android) {
      easJson.build.ci.android = {};
    }
    
    if (!easJson.build.ci.android.env) {
      easJson.build.ci.android.env = {};
    }
    
    // 環境変数の追加
    easJson.build.ci.android.env = {
      ...easJson.build.ci.android.env,
      EXPO_ANDROID_KEYSTORE_PASSWORD: 'android',
      EXPO_ANDROID_KEY_PASSWORD: 'android',
      JAVA_TOOL_OPTIONS: '-XX:MaxHeapSize=8g -Xmx8g -Dfile.encoding=UTF-8',
      EXPO_PATCH_APPLIED: 'true',
      EXPO_NO_CACHE: 'true'
    };
    
    // 更新したeas.jsonを保存
    fs.writeFileSync(easJsonPath, JSON.stringify(easJson, null, 2));
    log.success('eas.jsonを更新しました');
    return true;
  } catch (error) {
    log.error(`eas.jsonの更新に失敗しました: ${error.message}`);
    return false;
  }
};

// ExpoのPrebuildsフォルダを確認
const checkExpoPrebuilds = () => {
  log.info('Expoのprebuildsを確認しています...');
  
  const prebuildsDir = path.join(process.cwd(), '.expo-prebuild');
  
  if (fs.existsSync(prebuildsDir)) {
    try {
      const stats = fs.statSync(prebuildsDir);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      log.info(`prebuildsディレクトリ: ${prebuildsDir} (${fileSizeInMB.toFixed(2)} MB)`);
      
      // 大きすぎる場合は削除
      if (fileSizeInMB > 100) {
        log.warn('prebuildsディレクトリが大きすぎます。削除します...');
        fs.rmSync(prebuildsDir, { recursive: true, force: true });
        log.success('prebuildsディレクトリを削除しました');
      }
    } catch (error) {
      log.error(`prebuildsディレクトリの確認中にエラーが発生しました: ${error.message}`);
    }
  } else {
    log.info('prebuildsディレクトリは存在しません');
  }
};

// 実行
const main = async () => {
  log.info('EAS設定の最適化を開始します...');
  
  const appJsonUpdated = updateAppJson();
  const easJsonUpdated = updateEasJson();
  checkExpoPrebuilds();
  
  if (appJsonUpdated && easJsonUpdated) {
    log.success('設定の最適化が完了しました');
  } else {
    log.warn('一部の設定の更新に失敗しました');
  }
};

// スクリプト実行
main().catch(error => {
  log.error(`スクリプト実行中にエラーが発生しました: ${error.message}`);
  process.exit(1);
});
