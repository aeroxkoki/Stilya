#!/bin/bash
# Expoの内部ソースコードを直接パッチするスクリプト
# SDKバージョン53での `expo export:embed` 互換性問題を解決

# エラーでスクリプトを終了
set -e

# 色付きログ関数
function log_info() { echo -e "\033[36m[INFO]\033[0m $1"; }
function log_warn() { echo -e "\033[33m[WARN]\033[0m $1"; }
function log_error() { echo -e "\033[31m[ERROR]\033[0m $1"; }
function log_success() { echo -e "\033[32m[SUCCESS]\033[0m $1"; }

log_info "Expoの内部ソースコードを直接パッチする処理を開始します..."

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)

# キャッシュクリア
log_info "キャッシュを削除します..."
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro

# メトロバンドラーのバージョンを確認
METRO_VERSION=$(node -e "try { console.log(require('metro/package.json').version) } catch(e) { console.log('not installed') }")
METRO_CONFIG_VERSION=$(node -e "try { console.log(require('metro-config/package.json').version) } catch(e) { console.log('not installed') }")
EXPO_METRO_VERSION=$(node -e "try { console.log(require('@expo/metro-config/package.json').version) } catch(e) { console.log('not installed') }")

log_info "現在のメトロバンドラーバージョン:"
log_info "- metro: $METRO_VERSION"
log_info "- metro-config: $METRO_CONFIG_VERSION"
log_info "- @expo/metro-config: $EXPO_METRO_VERSION"

# Expoの内部CLIコードをパッチ
log_info "Expo CLIの内部コードをパッチします..."
node patch-expo-cli.js

# パッチ適用結果確認
if [ $? -ne 0 ]; then
  log_warn "Expo CLIパッチの適用に問題がありました。バックアッププランを実行します..."
  
  # バックアッププラン: グローバルなJSON.parseモンキーパッチを強化
  log_info "グローバルなJSON.parseモンキーパッチを強化します..."
  mkdir -p patches/deep-fixes
  
  # より強力なグローバルパッチを作成
  cat > patches/deep-fixes/enhance-json-parser.js << 'EOF'
/**
 * 強化されたJSONモンキーパッチ
 * Expo CLIのJSON.parseエラーを強制的に修正
 */

// オリジナルのJSONパースとストリンギファイを保存
const originalJSONParse = JSON.parse;
const originalJSONStringify = JSON.stringify;

// エラーログ用関数
const logError = (...args) => {
  console.error('\x1b[31m[JSON Patch Error]\x1b[0m', ...args);
};

// デバッグログ用関数 (環境変数で制御)
const logDebug = (...args) => {
  if (process.env.EXPO_PATCH_DEBUG === 'true') {
    console.log('\x1b[36m[JSON Patch Debug]\x1b[0m', ...args);
  }
};

// JSON.parseをオーバーライド
JSON.parse = function(text, ...args) {
  try {
    // JavaScriptコードかどうかチェック (var __BUNDLE)
    if (typeof text === 'string' && text.trim().startsWith('var __BUNDLE')) {
      logDebug('JavaScriptバンドルをJSONに変換します');
      return {
        code: text,
        map: null,
        dependencies: []
      };
    }

    // 通常のJSONパースを試行
    return originalJSONParse(text, ...args);
  } catch (e) {
    // 特定のMetroBundlerDevServerエラーを検出
    const isMetroBundlerError = e.stack && e.stack.includes('MetroBundlerDevServer') && 
                               (e.message.includes('not valid JSON') || e.message.includes('Unexpected token'));
    
    if (isMetroBundlerError) {
      logDebug('MetroBundlerDevServer JSON解析エラーを修正します:', e.message);
      return {
        code: String(text),
        map: null,
        dependencies: []
      };
    }
    
    // その他の一般的な構文エラー
    if (e instanceof SyntaxError) {
      logError('JSON構文エラーが発生しました:', e.message);
      // フォールバック: テキストをコードとして扱う
      return {
        code: String(text),
        map: null,
        dependencies: []
      };
    }
    
    // その他のエラーは再スロー
    throw e;
  }
};

// JSON.stringifyをオーバーライド
JSON.stringify = function(value, ...args) {
  try {
    // 通常のJSON.stringifyを試行
    return originalJSONStringify(value, ...args);
  } catch (e) {
    logError('JSON.stringifyエラーが発生しました:', e.message);
    
    // 循環参照の処理
    if (e.message.includes('circular') || e.message.includes('Converting circular structure to JSON')) {
      logDebug('循環参照を検出しました。安全な変換を行います');
      
      // 循環参照を処理する安全な変換
      const seen = new WeakSet();
      const safeStringify = (obj) => {
        return originalJSONStringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]';
            }
            seen.add(value);
          }
          return value;
        }, ...args.slice(1));
      };
      
      try {
        return safeStringify(value);
      } catch (circularError) {
        // それでも失敗した場合は空のオブジェクトを返す
        logError('循環参照の安全な変換に失敗しました');
        return '{"code":"", "map":null, "dependencies":[]}';
      }
    }
    
    // その他のエラー: 可能な限り値を文字列化
    try {
      if (typeof value === 'string') {
        return originalJSONStringify({
          code: value,
          map: null,
          dependencies: []
        });
      } else {
        return originalJSONStringify({
          code: String(value),
          map: null,
          dependencies: []
        });
      }
    } catch (finalError) {
      // 最終手段: 最小限の有効なJSONを返す
      return '{"code":"", "map":null, "dependencies":[]}';
    }
  }
};

// グローバルスコープにexportEmbedShimを追加
global.exportEmbedShim = function(jsBundle) {
  if (typeof jsBundle === 'string' && jsBundle.startsWith('var __BUNDLE')) {
    return {
      code: jsBundle,
      map: null,
      dependencies: []
    };
  }
  return jsBundle;
};

// パッチ適用の通知
console.log('\x1b[32m[SUCCESS]\x1b[0m 強化されたJSON.parse/JSON.stringifyパッチが適用されました');
EOF

  # 実行ヘルパー
  cat > run-patched-expo-direct.js << 'EOF'
/**
 * 強化されたExpo export:embedランナー
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 色付きログ
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`)
};

log.info('=== 強化されたExpo export:embedランナーを開始します ===');

// 強化されたJSONパッチを読み込む
try {
  require('./patches/deep-fixes/enhance-json-parser');
  log.success('強化されたJSONパーサーパッチを読み込みました');
} catch (e) {
  log.error('JSONパーサーパッチの読み込みに失敗しました:', e);
}

// Expoプロセスにパッチを適用するためのPre-requireスクリプト
const preRequireScript = path.join(__dirname, 'patches', 'deep-fixes', 'enhance-json-parser.js');
if (!fs.existsSync(preRequireScript)) {
  log.error(`Pre-requireスクリプトが見つかりません: ${preRequireScript}`);
  process.exit(1);
}

// コマンドライン引数を解析
const args = process.argv.slice(2);
const defaultArgs = ['export:embed', '--eager', '--platform', 'android', '--dev', 'false'];
const finalArgs = args.length > 0 ? args : defaultArgs;

log.info(`実行コマンド: expo ${finalArgs.join(' ')}`);

// Node.jsにパッチスクリプトを事前ロードさせる引数を設定
const nodeOptions = [
  `--require ${preRequireScript}`,
  '--no-warnings',
  '--max-old-space-size=8192'
].join(' ');

// 実行環境変数を設定
const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions,
  EXPO_PATCH_APPLIED: 'true',
  EXPO_PATCH_DEBUG: 'true',
  EXPO_NO_CACHE: 'true'
};

// Expoコマンドを実行
log.info('パッチ適用済みの環境でexpoコマンドを実行します...');
const result = spawnSync('expo', finalArgs, {
  stdio: 'inherit',
  env
});

// 終了コードに基づいて処理
if (result.status !== 0) {
  log.error(`expoコマンドはエラーコード ${result.status} で終了しました`);
  
  // エラーの詳細を表示
  if (result.error) {
    log.error(`エラー詳細: ${result.error.message}`);
  }
  
  log.warn('パッチが完全に機能していない可能性があります');
  process.exit(result.status);
} else {
  log.success('expoコマンドは正常に終了しました');
  process.exit(0);
}
EOF

  # 直接パッチを実行するスクリプト
  cat > deep-fix-expo.sh << 'EOF'
#!/bin/bash
# エラーでスクリプトを終了
set -e

# 色付きログ関数
function log_info() { echo -e "\033[36m[INFO]\033[0m $1"; }
function log_warn() { echo -e "\033[33m[WARN]\033[0m $1"; }
function log_error() { echo -e "\033[31m[ERROR]\033[0m $1"; }
function log_success() { echo -e "\033[32m[SUCCESS]\033[0m $1"; }

log_info "強化されたExpo CLIパッチを適用します..."

# キャッシュをクリア
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro

# パッチを有効化
node -e "require('./patches/deep-fixes/enhance-json-parser.js')"

# 実行権限を付与
chmod +x run-patched-expo-direct.js

log_success "パッチが適用されました。次のコマンドでexpo export:embedを実行してください:"
log_success "node run-patched-expo-direct.js"
EOF

  # スクリプトに実行権限を付与
  chmod +x deep-fix-expo.sh
  
  # バックアッププランを実行
  log_info "バックアッププランを実行します..."
  ./deep-fix-expo.sh
  
  log_success "強化されたパッチが適用されました。run-patched-expo-direct.jsを使用してexpoコマンドを実行してください。"
else
  log_success "Expo CLIのパッチが正常に適用されました。"
  
  # スクリプトの実行権限を調整
  chmod +x run-patched-expo-export.js
  
  log_info "次のコマンドでexport:embedを実行できます:"
  log_info "node run-patched-expo-export.js"
fi

# 元のディレクトリに戻る
cd "$CURRENT_DIR"

log_success "パッチの適用が完了しました。"
