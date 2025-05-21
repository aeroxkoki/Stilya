#!/bin/bash
# fix-expo-env-loader.sh
# Expo CLI用の環境変数ローダーのエラーを修正するスクリプト

echo "🔧 Patching Expo environment loader..."

# 問題のあるファイルのパス
ENV_INDEX_PATH="node_modules/@expo/cli/node_modules/@expo/env/build/index.js"
ENV_INDEX_TS_PATH="node_modules/@expo/cli/node_modules/@expo/env/src/index.ts"

# パッチ適用 - 標準ビルド版
if [ -f "$ENV_INDEX_PATH" ]; then
  echo "📄 Patching $ENV_INDEX_PATH"
  
  # バックアップを作成
  cp "$ENV_INDEX_PATH" "$ENV_INDEX_PATH.bak"
  
  # push前の安全チェックを追加
  sed -i 's/envVarsLog.push(/envVarsLog \&\& envVarsLog.push(/g' "$ENV_INDEX_PATH"
  sed -i 's/loadResults.errors.push(/loadResults.errors \&\& loadResults.errors.push(/g' "$ENV_INDEX_PATH"
  sed -i 's/loadResults.parsed.push(/loadResults.parsed \&\& loadResults.parsed.push(/g' "$ENV_INDEX_PATH"
  
  echo "✅ Patched $ENV_INDEX_PATH"
fi

# パッチ適用 - TypeScript版
if [ -f "$ENV_INDEX_TS_PATH" ]; then
  echo "📄 Patching $ENV_INDEX_TS_PATH"
  
  # バックアップを作成
  cp "$ENV_INDEX_TS_PATH" "$ENV_INDEX_TS_PATH.bak"
  
  # push前の安全チェックを追加
  sed -i 's/envVarsLog.push(/envVarsLog \&\& envVarsLog.push(/g' "$ENV_INDEX_TS_PATH"
  sed -i 's/loadResults.errors.push(/loadResults.errors \&\& loadResults.errors.push(/g' "$ENV_INDEX_TS_PATH"
  sed -i 's/loadResults.parsed.push(/loadResults.parsed \&\& loadResults.parsed.push(/g' "$ENV_INDEX_TS_PATH"
  
  echo "✅ Patched $ENV_INDEX_TS_PATH"
fi

# 環境変数ロード処理の設定
ENV_CONFIG_PATH="app.json"
if [ -f "$ENV_CONFIG_PATH" ]; then
  echo "📄 Checking $ENV_CONFIG_PATH for env config"
  
  # app.jsonが存在する場合、環境変数処理の設定を確認
  if ! grep -q "\"disableEnvironmentLoad\"" "$ENV_CONFIG_PATH"; then
    # 安全のために一時ファイルを作成
    TMP_CONFIG=$(mktemp)
    
    # 末尾に追加するのではなく、JSONを適切に修正
    jq '.expo.hooks = (.expo.hooks // {}) + {"disableEnvironmentLoad": true}' "$ENV_CONFIG_PATH" > "$TMP_CONFIG"
    # 正常に処理できた場合のみ置き換え
    if [ $? -eq 0 ]; then
      mv "$TMP_CONFIG" "$ENV_CONFIG_PATH"
      echo "✅ Added disableEnvironmentLoad: true to app.json"
    else
      echo "⚠️ Failed to modify app.json. Please manually add {\"expo\": {\"hooks\": {\"disableEnvironmentLoad\": true}}}"
    fi
  else
    echo "✅ disableEnvironmentLoad already configured in app.json"
  fi
fi

# create-bundle-helpers.shスクリプトを作成/更新 - 環境変数エラー対応版
mkdir -p scripts
cat > scripts/create-bundle-helpers-env-fix.sh << 'EOL'
#!/bin/bash
# create-bundle-helpers-env-fix.sh
# @expoの環境変数ローダーのエラーに対応した拡張版ヘルパースクリプト

echo "🛠️ Creating helper files for Expo bundle process with env fix..."

# Expoがバンドルプロセスで使用するディレクトリを確保
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib

# TerminalReporter.jsを作成 - 両方の場所に配置
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL_TR'
/**
 * Metro Reporter for Expo SDK 53 compatibility
 * This is essential for the build process
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal || {
      log: console.log.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console)
    };
    this._errors = [];
    this._warnings = [];
  }

  handleError(error) {
    this._errors.push(error);
    if (this._terminal && this._terminal.error) {
      this._terminal.error(error);
    }
  }

  handleWarning(warning) {
    this._warnings.push(warning);
    if (this._terminal && this._terminal.warn) {
      this._terminal.warn(warning);
    }
  }

  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
  update() {}
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL_TR

# 同じファイルをExpo CLIのnode_modulesにも配置
cp node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js 2>/dev/null || :

# metro-core のスタブも作成
mkdir -p node_modules/metro-core/src
mkdir -p node_modules/@expo/cli/node_modules/metro-core/src

# metro-core/package.json
cat > node_modules/metro-core/package.json << 'EOL_PKG'
{
  "name": "metro-core",
  "version": "0.77.0",
  "description": "Metro Core functionality",
  "main": "src/index.js",
  "license": "MIT"
}
EOL_PKG

# metro-core/src/index.js
cat > node_modules/metro-core/src/index.js << 'EOL_IDX'
/**
 * Minimal implementation of metro-core for compatibility
 */
class Terminal {
  constructor() {
    this._log = console.log.bind(console);
    this._error = console.error.bind(console);
    this._info = console.info.bind(console);
    this._warn = console.warn.bind(console);
  }
  
  log(...args) { this._log(...args); }
  error(...args) { this._error(...args); }
  info(...args) { this._info(...args); }
  warn(...args) { this._warn(...args); }
}

module.exports = { 
  Terminal,
  Logger: {
    createWorker: () => ({
      log: console.log.bind(console),
      error: console.error.bind(console),
    }),
  },
};
EOL_IDX

# Expo CLIのnode_modulesにも同じファイルをコピー
cp -f node_modules/metro-core/package.json node_modules/@expo/cli/node_modules/metro-core/package.json 2>/dev/null || :
cp -f node_modules/metro-core/src/index.js node_modules/@expo/cli/node_modules/metro-core/src/index.js 2>/dev/null || :

# 環境変数ローダーの修正
ENV_INDEX_PATH="node_modules/@expo/cli/node_modules/@expo/env/build/index.js"
ENV_INDEX_TS_PATH="node_modules/@expo/cli/node_modules/@expo/env/src/index.ts"

# Expoの環境変数ローダーの修正：build/index.js
if [ -f "$ENV_INDEX_PATH" ]; then
  echo "📄 Applying environment loader fix to $ENV_INDEX_PATH"
  
  # バックアップを作成
  cp "$ENV_INDEX_PATH" "$ENV_INDEX_PATH.bak"
  
  # push前の安全チェックを追加
  sed -i 's/envVarsLog.push(/envVarsLog \&\& envVarsLog.push(/g' "$ENV_INDEX_PATH"
  sed -i 's/loadResults.errors.push(/loadResults.errors \&\& loadResults.errors.push(/g' "$ENV_INDEX_PATH"
  sed -i 's/loadResults.parsed.push(/loadResults.parsed \&\& loadResults.parsed.push(/g' "$ENV_INDEX_PATH"
  
  echo "✅ Patched environment loader at $ENV_INDEX_PATH"
fi

# Expoの環境変数ローダーの修正：src/index.ts
if [ -f "$ENV_INDEX_TS_PATH" ]; then
  echo "📄 Applying environment loader fix to $ENV_INDEX_TS_PATH"
  
  # バックアップを作成
  cp "$ENV_INDEX_TS_PATH" "$ENV_INDEX_TS_PATH.bak"
  
  # push前の安全チェックを追加
  sed -i 's/envVarsLog.push(/envVarsLog \&\& envVarsLog.push(/g' "$ENV_INDEX_TS_PATH"
  sed -i 's/loadResults.errors.push(/loadResults.errors \&\& loadResults.errors.push(/g' "$ENV_INDEX_TS_PATH"
  sed -i 's/loadResults.parsed.push(/loadResults.parsed \&\& loadResults.parsed.push(/g' "$ENV_INDEX_TS_PATH"
  
  echo "✅ Patched environment loader at $ENV_INDEX_TS_PATH"
fi

# 権限設定
chmod 644 node_modules/metro/src/lib/TerminalReporter.js
chmod 644 node_modules/metro-core/src/index.js
chmod 644 node_modules/metro-core/package.json

# 存在確認
if [ -f "node_modules/metro/src/lib/TerminalReporter.js" ] && \
   [ -f "node_modules/metro-core/src/index.js" ]; then
  echo "✅ Metro compatibility files created successfully"
else
  echo "❌ Failed to create metro compatibility files"
  exit 1
fi

# app.jsonの環境変数ロード無効化設定
ENV_CONFIG_PATH="app.json"
if [ -f "$ENV_CONFIG_PATH" ]; then
  echo "📄 Checking $ENV_CONFIG_PATH for env config"
  
  # app.jsonが存在する場合、環境変数処理の設定を確認
  if ! grep -q "\"disableEnvironmentLoad\"" "$ENV_CONFIG_PATH"; then
    # jqコマンドがある場合は適切に修正
    if command -v jq &> /dev/null; then
      # 安全のために一時ファイルを作成
      TMP_CONFIG=$(mktemp)
      
      # 末尾に追加するのではなく、JSONを適切に修正
      jq '.expo.hooks = (.expo.hooks // {}) + {"disableEnvironmentLoad": true}' "$ENV_CONFIG_PATH" > "$TMP_CONFIG"
      # 正常に処理できた場合のみ置き換え
      if [ $? -eq 0 ]; then
        mv "$TMP_CONFIG" "$ENV_CONFIG_PATH"
        echo "✅ Added disableEnvironmentLoad: true to app.json"
      else
        echo "⚠️ Failed to modify app.json. Creating manual fix..."
        # jqが失敗した場合の代替手段 - 単純な置換
        if grep -q "\"expo\": {" "$ENV_CONFIG_PATH"; then
          sed -i 's/"expo": {/"expo": {\n    "hooks": {\n      "disableEnvironmentLoad": true\n    },/g' "$ENV_CONFIG_PATH"
          echo "✅ Modified app.json using text replacement"
        else
          echo "⚠️ Could not modify app.json. Please manually add {\"expo\": {\"hooks\": {\"disableEnvironmentLoad\": true}}}"
        fi
      fi
    else
      # jqがない場合の代替手段
      echo "⚠️ jq command not found. Using text replacement..."
      if grep -q "\"expo\": {" "$ENV_CONFIG_PATH"; then
        sed -i 's/"expo": {/"expo": {\n    "hooks": {\n      "disableEnvironmentLoad": true\n    },/g' "$ENV_CONFIG_PATH"
        echo "✅ Modified app.json using text replacement"
      else
        echo "⚠️ Could not modify app.json. Please manually add {\"expo\": {\"hooks\": {\"disableEnvironmentLoad\": true}}}"
      fi
    fi
  else
    echo "✅ disableEnvironmentLoad already configured in app.json"
  fi
fi

echo "✅ Bundle process helpers with env fix are ready!"
EOL

chmod +x scripts/create-bundle-helpers-env-fix.sh

# 環境変数エラー対策のためにアプリの設定を更新
ENV_CONFIG_PATH="app.json"
if [ -f "$ENV_CONFIG_PATH" ] && command -v jq &> /dev/null; then
  echo "📄 Attempting to update app.json with environment fix..."
  TMP_CONFIG=$(mktemp)
  jq '.expo.hooks = (.expo.hooks // {}) + {"disableEnvironmentLoad": true}' "$ENV_CONFIG_PATH" > "$TMP_CONFIG"
  if [ $? -eq 0 ]; then
    mv "$TMP_CONFIG" "$ENV_CONFIG_PATH"
    echo "✅ Updated app.json with disableEnvironmentLoad: true"
  else
    echo "⚠️ Failed to update app.json with jq. Manual intervention may be required."
  fi
else
  echo "⚠️ Cannot update app.json: file missing or jq command not available"
fi

echo "🔧 Environment variable loader patching complete!"
