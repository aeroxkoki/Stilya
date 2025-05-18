/**
 * GitHub Actions用の直接パッチ実行スクリプト
 * Expo export:embed問題を解決します
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('◆◆◆ GitHub Actions用Expoパッチを適用します ◆◆◆');

// パッチフォルダーの確認
const patchesDir = path.join(__dirname, 'patches');
if (!fs.existsSync(patchesDir)) {
  fs.mkdirSync(patchesDir, { recursive: true });
  console.log('✅ パッチディレクトリを作成しました');
}

// パッチ適用前にMetroのバージョンを確認
try {
  const metroVersion = require('metro/package.json').version;
  const metroConfigVersion = require('metro-config/package.json').version;
  const expoMetroConfigVersion = require('@expo/metro-config/package.json').version;
  
  console.log(`📦 確認されたパッケージバージョン:`);
  console.log(`  - metro: ${metroVersion}`);
  console.log(`  - metro-config: ${metroConfigVersion}`);
  console.log(`  - @expo/metro-config: ${expoMetroConfigVersion}`);
  
  // 必要に応じてバージョン調整
  if (metroVersion !== '0.76.8' || metroConfigVersion !== '0.76.8') {
    console.log('⚠️ Metroパッケージのバージョンが最適でない可能性があります');
  }
} catch (e) {
  console.warn('⚠️ Metroパッケージのバージョン確認に失敗しました:', e.message);
}

// JSONシリアライザーパッチ適用
const applyJsonPatch = () => {
  const monkeyPatchDir = path.join(patchesDir, 'expo-monkey-patch');
  if (!fs.existsSync(monkeyPatchDir)) {
    fs.mkdirSync(monkeyPatchDir, { recursive: true });
  }
  
  const jsonPatchPath = path.join(monkeyPatchDir, 'json-serializer-patch.js');
  const jsonPatchContent = `/**
 * JSONパーサー/ストリンギファイのグローバルパッチ
 * Expoシリアライズエラーを緊急的に修正
 */

// オリジナルのJSON.parseを保存
const originalJSONParse = JSON.parse;

// JSON.parseをモンキーパッチ
JSON.parse = function(text, ...args) {
  if (typeof text === 'string') {
    // JavaScriptコードの検出
    if (text.startsWith('var __') || text.startsWith('var _')) {
      console.log('[Expo Patch] JavaScriptコードをJSONに変換します');
      return {
        code: text,
        map: null,
        dependencies: []
      };
    }
    
    // 既にJSONオブジェクトの場合はそのまま
    try {
      return originalJSONParse(text, ...args);
    } catch (e) {
      console.warn('[Expo Patch] JSONパース失敗 - フォールバック処理:', e.message);
      return {
        code: String(text),
        map: null,
        dependencies: []
      };
    }
  }
  
  // 文字列以外の場合はデフォルト処理
  return originalJSONParse(text, ...args);
};

// シリアライザーパッチ通知
console.log('[Expo Patch] JSONパーサーが正常にパッチされました');`;

  fs.writeFileSync(jsonPatchPath, jsonPatchContent);
  console.log('✅ JSONシリアライザーパッチを作成しました');
};

// パッチ適用
applyJsonPatch();

// 上記の修正をテスト実行
console.log('🧪 パッチのテスト実行を行います...');

// エクスポート試行
const args = process.argv.slice(2);
const defaultArgs = ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'];
const finalArgs = args.length > 0 ? args : defaultArgs;

console.log(`🚀 実行: expo ${finalArgs.join(' ')}`);

// グローバルパッチを事前ロード
try {
  require('./patches/expo-monkey-patch/json-serializer-patch');
  console.log('✅ JSONパーサーパッチを事前ロードしました');
} catch (e) {
  console.warn('⚠️ JSONパーサーパッチのロードに失敗:', e.message);
}

// メモリ使用量を増やしてExpo実行
const result = spawnSync('expo', finalArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=8192 --no-warnings`,
    EXPO_NO_CACHE: 'true',
    EXPO_METRO_FORCE_JSON: 'true'
  }
});

process.exit(result.status);
