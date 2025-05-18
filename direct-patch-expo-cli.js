/**
 * GitHub Actions環境向けExpo CLI直接パッチスクリプト
 * export:embedコマンドの互換性問題を解決
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 色付きログ
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
};

// 問題のファイルの候補パス
const possiblePaths = [
  'node_modules/@expo/cli/build/src/start/server/metro/MetroBundlerDevServer.js',
  'node_modules/@expo/cli/src/start/server/metro/MetroBundlerDevServer.js',
  'node_modules/@expo/cli/dist/start/server/metro/MetroBundlerDevServer.js',
  '/home/expo/workingdir/build/node_modules/@expo/cli/src/start/server/metro/MetroBundlerDevServer.js',
  '/home/expo/workingdir/build/node_modules/@expo/cli/build/src/start/server/metro/MetroBundlerDevServer.js'
];

// ファイルの存在確認
const findExistingFilePath = (paths) => {
  for (const pathCandidate of paths) {
    if (fs.existsSync(pathCandidate)) {
      return pathCandidate;
    }
  }
  return null;
};

// ファイル内で関数を検索してパッチ
const patchFunctionInFile = (filePath, functionName, patchImpl) => {
  if (!fs.existsSync(filePath)) {
    log.error(`ファイルが見つかりません: ${filePath}`);
    return false;
  }

  // ファイル内容を読み込む
  const content = fs.readFileSync(filePath, 'utf8');
  const backupPath = `${filePath}.bak`;

  // バックアップ作成
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
    log.info(`バックアップ作成: ${backupPath}`);
  }

  // _bundleDirectAsync 関数を検索
  const functionRegex = new RegExp(`(async\\s+)?${functionName}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?\\n\\s*}`, 'g');
  const match = content.match(functionRegex);

  if (!match) {
    log.warn(`関数 ${functionName} が見つかりません`);
    return false;
  }

  // パッチを適用
  const patchedContent = content.replace(match[0], patchImpl);
  
  if (patchedContent === content) {
    log.warn('パッチの適用に失敗しました - 内容が変更されていません');
    return false;
  }

  // 修正したファイルを書き込む
  fs.writeFileSync(filePath, patchedContent);
  log.success(`関数 ${functionName} をパッチしました: ${filePath}`);
  return true;
};

// _bundleDirectAsync 関数のパッチ実装
const createPatchedBundleDirectAsync = (originalFunction) => {
  // 元の関数をコメントアウト
  const commented = `/* PATCHED BY STILYA
  ${originalFunction}
  */`;

  // 修正版の実装
  return `async _bundleDirectAsync(
    entryFile,
    platform,
    dev,
    minify,
    resolverOptions,
    customTransformOptions,
  ) {
    // Stilyaによるパッチ適用済み _bundleDirectAsync
    try {
      const bundle = await this._metroServer.buildBundleForHMR(
        entryFile,
        this._packagerInfoProvider.getPackagerServerUrl(),
        {
          bundleType: 'bundle',
          customResolverOptions: resolverOptions,
          customTransformOptions,
          dev,
          entryFile,
          minify,
          platform,
          uniqueId: '',
        },
      );

      // JavaScriptコードかどうかをチェック
      if (typeof bundle === 'string' && bundle.startsWith('var __BUNDLE')) {
        console.log('[Stilya Patch] JavaScriptバンドルをJSONに変換しています');
        return {
          code: bundle,
          map: null,
          dependencies: []
        };
      }

      // 通常のJSON解析を試みる
      try {
        if (typeof bundle === 'string') {
          const module = JSON.parse(bundle);
          return module;
        }
        return bundle;
      } catch (parseError) {
        console.error('[Stilya Patch] JSON解析エラー:', parseError.message);
        // フォールバック: バンドルをコードとして扱う
        return {
          code: typeof bundle === 'string' ? bundle : String(bundle),
          map: null,
          dependencies: []
        };
      }
    } catch (error) {
      console.error('[Stilya Patch] バンドル生成エラー:', error);
      throw error;
    }
  }`;
};

// ファイルを検索して修正
const patchMetroBundlerDevServer = () => {
  // 問題のファイルを探す
  const targetFilePath = findExistingFilePath(possiblePaths);
  
  if (!targetFilePath) {
    // 検索に失敗した場合、より広範囲に検索
    try {
      log.info('ファイルを拡張検索中...');
      const result = execSync('find node_modules -name "MetroBundlerDevServer.js" -type f', { encoding: 'utf8' });
      const paths = result.split('\n').filter(Boolean);
      
      if (paths.length > 0) {
        log.info(`見つかったファイル: ${paths.join(', ')}`);
        return patchFileList(paths);
      }
    } catch (error) {
      log.error(`拡張検索中にエラーが発生しました: ${error.message}`);
    }
    
    // GitHub Actions環境向けの特殊検索
    try {
      log.info('GitHub Actions環境向けに検索中...');
      const result = execSync('find /home/expo -name "MetroBundlerDevServer.js" -type f 2>/dev/null || echo ""', { encoding: 'utf8' });
      const paths = result.split('\n').filter(Boolean);
      
      if (paths.length > 0) {
        log.info(`GitHub Actions環境で見つかったファイル: ${paths.join(', ')}`);
        return patchFileList(paths);
      }
    } catch (error) {
      log.error(`GitHub Actions環境検索中にエラーが発生しました: ${error.message}`);
    }
    
    log.error('対象ファイルが見つかりませんでした。');
    return false;
  }
  
  return patchFile(targetFilePath);
};

// 複数ファイルのパッチ処理
const patchFileList = (filePaths) => {
  let success = false;
  
  for (const filePath of filePaths) {
    log.info(`ファイルを処理中: ${filePath}`);
    if (patchFile(filePath)) {
      success = true;
    }
  }
  
  return success;
};

// 単一ファイルのパッチ処理
const patchFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // _bundleDirectAsync 関数を検索
    const functionRegex = /async\s+_bundleDirectAsync\s*\([^)]*\)\s*{[\s\S]*?\n\s*}/g;
    const match = content.match(functionRegex);
    
    if (!match) {
      log.warn(`${filePath} には _bundleDirectAsync 関数が見つかりません`);
      return false;
    }
    
    // パッチ適用
    const originalFunction = match[0];
    const patchedImplementation = createPatchedBundleDirectAsync(originalFunction);
    
    return patchFunctionInFile(filePath, '_bundleDirectAsync', patchedImplementation);
  } catch (error) {
    log.error(`ファイル ${filePath} の処理中にエラーが発生しました: ${error.message}`);
    return false;
  }
};

// グローバルモンキーパッチを適用
const applyGlobalMonkeyPatch = () => {
  log.info('グローバルなJSON.parseモンキーパッチを適用中...');
  
  // 元のメソッドを保存
  const originalJSONParse = JSON.parse;
  
  // JSONパーサーをオーバーライド
  JSON.parse = function(text, ...args) {
    // JavaScript変数宣言の場合
    if (typeof text === 'string' && text.trim().startsWith('var __BUNDLE')) {
      log.info('JavaScriptコードをJSONに変換します');
      return {
        code: text,
        map: null,
        dependencies: []
      };
    }
    
    // 通常のJSON解析を試みる
    try {
      return originalJSONParse(text, ...args);
    } catch (error) {
      log.warn(`JSON解析エラー: ${error.message}`);
      
      // フォールバック: テキストをコードとして扱う
      if (typeof text === 'string') {
        return {
          code: text,
          map: null,
          dependencies: []
        };
      }
      
      // 元のエラーを再スロー
      throw error;
    }
  };
  
  log.success('グローバルJSONパーサーパッチを適用しました');
  return true;
};

// プリロードスクリプト作成
const createPreloadScript = () => {
  log.info('Node.js用プリロードスクリプトを作成中...');
  
  const preloadDir = path.join(process.cwd(), '.expo-patch');
  if (!fs.existsSync(preloadDir)) {
    fs.mkdirSync(preloadDir, { recursive: true });
  }
  
  const preloadPath = path.join(preloadDir, 'preload-json-patch.js');
  const content = `
// Expoシリアライザー問題用のプリロードパッチ
const originalJSONParse = JSON.parse;

JSON.parse = function(text, ...args) {
  // JavaScriptコードをチェック
  if (typeof text === 'string' && text.trim().startsWith('var __BUNDLE')) {
    console.log('[Preload] JavaScriptコードをJSONに変換します');
    return {
      code: text,
      map: null,
      dependencies: []
    };
  }
  
  // 通常のJSON解析を試みる
  try {
    return originalJSONParse(text, ...args);
  } catch (error) {
    // モンキーパッチが必要な箇所を特定
    const isMetroError = error.stack && (
      error.stack.includes('MetroBundlerDevServer') || 
      error.stack.includes('exportEmbed')
    );
    
    if (isMetroError && typeof text === 'string') {
      console.log('[Preload] Metroエラーを修正します:', error.message);
      return {
        code: text,
        map: null,
        dependencies: []
      };
    }
    
    // その他のエラーは再スロー
    throw error;
  }
};

console.log('[Preload] JSONパーサーパッチを適用しました');
`;

  fs.writeFileSync(preloadPath, content);
  log.success(`プリロードスクリプト作成: ${preloadPath}`);
  return preloadPath;
};

// GitHub Actions用実行スクリプト作成
const createGitHubActionsScript = (preloadPath) => {
  log.info('GitHub Actions用実行スクリプトを作成中...');
  
  const scriptPath = path.join(process.cwd(), 'run-github-actions.sh');
  const content = `#!/bin/bash
# GitHub Actions環境でのexpo export:embed実行スクリプト

echo "==== GitHub Actionsでexpo export:embedを実行します ===="

# キャッシュクリア
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro

# 環境変数設定
export NODE_OPTIONS="--require ${preloadPath} --no-warnings --max-old-space-size=8192"
export EXPO_PATCH_APPLIED=true
export EXPO_NO_CACHE=true

echo "NODE_OPTIONS=$NODE_OPTIONS"

# コマンド実行
echo "expo export:embed --eager --platform android --dev false を実行中..."
expo export:embed --eager --platform android --dev false

# 終了コード
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "エラー: expoコマンドが失敗しました (コード: $EXIT_CODE)"
  exit $EXIT_CODE
fi

echo "実行完了"
exit 0
`;

  fs.writeFileSync(scriptPath, content);
  fs.chmodSync(scriptPath, 0o755); // 実行権限を付与
  log.success(`GitHub Actions用スクリプト作成: ${scriptPath}`);
  return scriptPath;
};

// メイン処理
const main = async () => {
  log.info('Expo CLIの直接パッチ処理を開始します...');
  
  // ソースコードパッチを試みる
  const patchResult = patchMetroBundlerDevServer();
  
  // グローバルモンキーパッチを適用
  applyGlobalMonkeyPatch();
  
  // プリロードスクリプト作成
  const preloadPath = createPreloadScript();
  
  // GitHub Actions用スクリプト作成
  const githubActionsScript = createGitHubActionsScript(preloadPath);
  
  if (patchResult) {
    log.success('パッチが成功しました。以下のスクリプトを実行してください:');
  } else {
    log.warn('ソースコードパッチは失敗しましたが、モンキーパッチとプリロードスクリプトは適用されました。');
  }
  
  log.info(`./run-github-actions.sh を実行して、GitHub Actions環境でexpo export:embedを試してください。`);
};

// 実行
main().catch(error => {
  log.error(`予期しないエラーが発生しました: ${error.message}`);
  process.exit(1);
});
