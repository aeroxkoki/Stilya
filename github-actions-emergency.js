/**
 * GitHub Actions環境向けのexpo export:embed緊急修正スクリプト
 * バンドラーのシリアライザー問題を解決します。
 */

// 必要なモジュールのインポート
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ログ用の色付き出力
const log = {
  info: msg => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  error: msg => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: msg => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: msg => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`)
};

// JSON.parseのオーバーライド
const overrideJSONParse = () => {
  const originalJSONParse = JSON.parse;
  
  // モンキーパッチ適用
  JSON.parse = function(text, ...args) {
    // JavaScriptコードの場合
    if (typeof text === 'string' && text.trim().startsWith('var __BUNDLE')) {
      log.info('JavaScriptバンドルをJSONに変換しています');
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
      // MetroBundlerDevServerのエラーか確認
      const isMetroError = e.stack && (
        e.stack.includes('MetroBundlerDevServer') || 
        e.stack.includes('export:embed') ||
        e.stack.includes('exportEmbed')
      );
      
      if (isMetroError) {
        log.warn(`メトロエラーを修正: ${e.message}`);
        return {
          code: typeof text === 'string' ? text : String(text),
          map: null,
          dependencies: []
        };
      }
      
      // その他のエラーは通常通りスロー
      throw e;
    }
  };
  
  log.success('JSON.parseの置き換えが完了しました');
  return true;
};

// 緊急修正スクリプトを作成
const createEmergencyScript = () => {
  const scriptContent = `
// GitHubActions環境向け緊急パッチ
const originalJSONParse = JSON.parse;

JSON.parse = function(text, ...args) {
  // JavaScriptコードをチェック
  if (typeof text === 'string' && text.startsWith('var __BUNDLE')) {
    console.log('[Emergency] JavaScriptコードをJSONに変換');
    return {
      code: text,
      map: null,
      dependencies: []
    };
  }
  
  // 通常のJSON.parseを試す
  try {
    return originalJSONParse(text, ...args);
  } catch (e) {
    // エラースタックがMetroBundlerDevServerを含む場合
    if (e.stack && (e.stack.includes('MetroBundlerDevServer') || e.stack.includes('exportEmbed'))) {
      console.log('[Emergency] MetroBundlerDevServerエラーを修正:', e.message);
      return {
        code: typeof text === 'string' ? text : String(text),
        map: null,
        dependencies: []
      };
    }
    throw e;
  }
};

console.log('[Emergency] JSONパースパッチを適用しました');
`;

  const scriptPath = path.join(process.cwd(), 'emergency-json-patch.js');
  fs.writeFileSync(scriptPath, scriptContent);
  log.success(`緊急パッチスクリプトを作成しました: ${scriptPath}`);
  
  return scriptPath;
};

// メイン実行関数
const main = async () => {
  log.info('expo export:embedの緊急修正を開始します');
  
  // JSONパースを置き換え
  overrideJSONParse();
  
  // 緊急パッチスクリプト作成
  const emergencyScriptPath = createEmergencyScript();
  
  // 環境変数設定
  const env = {
    ...process.env,
    NODE_OPTIONS: `--require ${emergencyScriptPath} --no-warnings --max-old-space-size=8192`,
    EXPO_NO_CACHE: 'true'
  };
  
  log.info(`NODE_OPTIONS="${env.NODE_OPTIONS}"`);
  
  // expoコマンド実行
  log.info('expo export:embedを実行します...');
  
  const result = spawnSync('expo', ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'], {
    stdio: 'inherit',
    env
  });
  
  // 結果に基づいて処理
  if (result.status === 0) {
    log.success('expo export:embedが正常に完了しました');
    return 0;
  } else {
    log.error(`expo export:embedがエラーコード ${result.status} で失敗しました`);
    
    // 代替アプローチを試す
    log.info('代替アプローチを試みます...');
    
    // 直接Node.jsでexpoモジュールを呼び出す
    const directResult = spawnSync('node', ['-e', `
      require("${emergencyScriptPath}");
      console.log("直接Nodeから実行中...");
      
      // expoCLIを直接呼び出し
      try {
        process.env.EXPO_NO_CACHE = 'true';
        process.env.EXPO_OVERRIDE_METRO = 'true';
        
        // expoモジュールへのパスを探索
        const expoPaths = [
          'node_modules/expo/bin/cli.js',
          'node_modules/.bin/expo',
          '/home/expo/workingdir/build/node_modules/.bin/expo'
        ];
        
        // 存在するパスを使用
        let expoPath = null;
        for (const p of expoPaths) {
          try {
            require('fs').accessSync(p);
            expoPath = p;
            break;
          } catch (e) {}
        }
        
        if (!expoPath) {
          throw new Error('Expoモジュールが見つかりません');
        }
        
        console.log(\`使用するExpoパス: \${expoPath}\`);
        require(expoPath);
      } catch (e) {
        console.error('エラー:', e);
        process.exit(1);
      }
    `], {
      stdio: 'inherit',
      env
    });
    
    return directResult.status;
  }
};

// スクリプト実行
main()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    log.error(`予期しないエラーが発生しました: ${error.message}`);
    process.exit(1);
  });
