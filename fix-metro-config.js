#!/usr/bin/env node

/**
 * Metro Config インストール修正スクリプト for Stilya
 * 
 * 問題: @expo/metro-config が package.json に存在するがインストールされていない
 * 解決策: Node.js スクリプトで直接インストール処理を実行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 @expo/metro-config のインストール問題を修正します...');

try {
  // ステップ1: 現在の状態確認
  console.log('📝 現在のインストール状態を確認中...');
  const metroConfigPath = path.resolve('./node_modules/@expo/metro-config');
  const isInstalled = fs.existsSync(metroConfigPath);
  
  if (isInstalled) {
    console.log('✅ @expo/metro-config は既にインストールされています。');
  } else {
    console.log('⚠️ @expo/metro-config がインストールされていません。インストールします...');
    
    // ステップ2: インストール実行
    try {
      execSync('npm install --save-dev @expo/metro-config@0.9.0 --force', { stdio: 'inherit' });
      console.log('✅ @expo/metro-config をインストールしました。');
    } catch (error) {
      console.error('❌ インストール中にエラーが発生しました:', error.message);
      
      // ステップ3: Fallback方法 - package.jsonを直接修正
      console.log('🔄 別の方法を試みます...');
      try {
        // package.jsonを読み込む
        const packageJsonPath = path.resolve('./package.json');
        const packageJson = require(packageJsonPath);
        
        // resolutionsに設定が存在するか確認
        if (packageJson.resolutions && packageJson.resolutions['@expo/metro-config']) {
          console.log('✅ package.jsonのresolutionsには既に設定があります。');
        } else {
          // resolutionsに追加
          packageJson.resolutions = packageJson.resolutions || {};
          packageJson.resolutions['@expo/metro-config'] = '0.9.0';
          
          // package.jsonを書き戻す
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
          console.log('✅ package.jsonのresolutionsを更新しました。');
          
          // 再インストール
          try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('✅ 依存関係を再インストールしました。');
          } catch (installError) {
            console.error('❌ 再インストール中にエラーが発生しました:', installError.message);
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback方法でも失敗しました:', fallbackError.message);
      }
    }
  }
  
  // ステップ4: 修正後の確認
  console.log('🔍 修正結果を確認中...');
  const isInstalledAfterFix = fs.existsSync(path.resolve('./node_modules/@expo/metro-config'));
  
  if (isInstalledAfterFix) {
    console.log('✅ @expo/metro-config が正常にインストールされていることを確認しました。');
  } else {
    console.log('⚠️ @expo/metro-config はまだインストールされていません。手動インストールが必要かもしれません。');
  }
  
  console.log('✅ 処理が完了しました。インストール状態をnpx expo-doctorで確認してください。');
} catch (error) {
  console.error('❌ 予期せぬエラーが発生しました:', error.message);
  process.exit(1);
}
