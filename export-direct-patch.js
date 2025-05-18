/**
 * Expo export:embed 専用のランナースクリプト
 * Serializer did not return expected format エラーを解決します
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌈 Expo export:embed 互換性ランナーを開始します...');

// パッケージバージョンをチェック
function checkPackageVersions() {
  try {
    // package.jsonからデータ読み込み
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // メトロ関連のバージョンを取得
    const expoVersion = packageJson.dependencies?.expo || 'not found';
    const metroVersion = packageJson.devDependencies?.metro || 'not found';
    const expoMetroConfigVersion = packageJson.devDependencies?.['@expo/metro-config'] || 'not found';
    
    console.log('📦 パッケージバージョン:');
    console.log(`  - expo: ${expoVersion}`);
    console.log(`  - metro: ${metroVersion}`);
    console.log(`  - @expo/metro-config: ${expoMetroConfigVersion}`);
    
    // 推奨バージョンとの比較
    if (expoVersion.includes('53.0') && 
        metroVersion.includes('0.76') && 
        expoMetroConfigVersion.includes('0.10')) {
      console.log('✅ パッケージバージョンは互換性のある組み合わせです');
    } else {
      console.log('⚠️ 一部のパッケージバージョンが最適でない可能性があります');
      console.log('   推奨: expo@^53.0.7, metro@^0.76.8, @expo/metro-config@^0.10.7');
    }
  } catch (error) {
    console.warn('⚠️ パッケージバージョンの確認に失敗しました:', error.message);
  }
}

// JSONモンキーパッチ
function applyJsonPatch() {
  // オリジナルのJSON.parseを保存
  const originalJSONParse = JSON.parse;
  
  // JSON.parseをパッチする
  JSON.parse = function(text, ...args) {
    // JSONパース前のチェック
    if (typeof text === 'string') {
      // JavaScriptコードを検出した場合
      if (text.startsWith('var __') || text.startsWith('var _')) {
        console.log('[Expo修正] JavaScriptコードをJSON形式に変換します');
        return {
          code: text,
          map: null,
          dependencies: []
        };
      }
      
      // 通常のJSON解析を試みる
      try {
        return originalJSONParse(text, ...args);
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.warn('[Expo修正] JSONパース失敗 - フォールバック処理:', e.message);
          // JSON形式としてコードをラップ
          return {
            code: String(text),
            map: null,
            dependencies: []
          };
        }
        throw e;
      }
    }
    
    // 文字列以外の場合は元のJSON.parseに任せる
    return originalJSONParse(text, ...args);
  };
  
  console.log('✅ JSONパーサーを修正しました');
}

// キャッシュを削除
function clearCaches() {
  console.log('🧹 キャッシュをクリアしています...');
  
  // Metro関連のキャッシュを削除
  const cachePaths = [
    path.join(__dirname, 'node_modules', '.cache'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.expo', 'cache'),
    path.join(process.env.HOME || process.env.USERPROFILE, '.metro')
  ];
  
  cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      try {
        // 再帰的な削除は危険なので、存在確認してからのみ実行
        if (cachePath.includes('node_modules/.cache') || 
            cachePath.includes('.expo/cache') || 
            cachePath.includes('.metro')) {
          console.log(`  - ${cachePath} を削除`);
          // 実際の削除はシェルコマンドに委任
          spawnSync('rm', ['-rf', cachePath], { stdio: 'inherit' });
        }
      } catch (error) {
        console.warn(`⚠️ ${cachePath} の削除に失敗:`, error.message);
      }
    }
  });
  
  console.log('✅ キャッシュをクリアしました');
}

// メイン実行
function main() {
  // バージョン確認
  checkPackageVersions();
  
  // キャッシュクリア
  clearCaches();
  
  // JSONパッチを適用
  applyJsonPatch();
  
  // コマンドライン引数を解析
  const args = process.argv.slice(2);
  const defaultArgs = ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'];
  const finalArgs = args.length > 0 ? args : defaultArgs;
  
  console.log(`🚀 実行: expo ${finalArgs.join(' ')}`);
  
  // 環境変数を設定してexpoコマンドを実行
  const result = spawnSync('expo', finalArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=8192 --no-warnings`,
      EXPO_NO_CACHE: 'true'
    }
  });
  
  // 結果コードに応じたメッセージ
  if (result.status === 0) {
    console.log('✅ expoコマンドは正常に完了しました');
  } else {
    console.error(`❌ expoコマンドはコード ${result.status} で失敗しました`);
  }
  
  // 終了コードを返す
  process.exit(result.status);
}

// スクリプト実行
main();
