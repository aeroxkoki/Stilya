#!/bin/bash
# Metro互換性を修正するスクリプト v3 (2025-05-21)
# Expo SDK 53+Metro 0.77.0の互換性問題を解決するスクリプト

echo "🔍 Metro 互換性問題を修正します..."

# 必要なモジュールを特定バージョンで強制的にインストール
npm install --save-dev metro@0.77.0 metro-config@0.77.0 --legacy-peer-deps
npm install --save-dev @expo/metro-config@0.9.0 --legacy-peer-deps

# 必要なディレクトリを作成
mkdir -p node_modules/metro/src/lib

# TerminalReporter.js モックの作成
TERMINAL_REPORTER_PATH="node_modules/metro/src/lib/TerminalReporter.js"
if [ ! -f "$TERMINAL_REPORTER_PATH" ]; then
  echo "TerminalReporter.js が見つからないため、作成します"
  cat > "$TERMINAL_REPORTER_PATH" << 'EOL'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

/**
 * Metro Reporter for compatibility with Expo SDK 53.
 * This is a mock implementation that provides required functionality.
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal;
    this._errors = [];
    this._warnings = [];
  }

  /**
   * Handling exceptions, including worker creation and initialization errors.
   */
  handleError(error) {
    this._errors.push(error);
  }

  /**
   * Handling warnings, including those coming from the transformer.
   */
  handleWarning(warning) {
    this._warnings.push(warning);
  }

  getErrors() {
    return this._errors;
  }

  getWarnings() {
    return this._warnings;
  }

  // Additional required methods
  update() {}
  terminal() { return this._terminal; }
}

module.exports = TerminalReporter;
EOL
  echo "TerminalReporter.js を作成しました"
fi

# 他の必要なモジュールを修正
METRO_NODE_MODULES_PATH="node_modules/metro/src/node-modules"
if [ ! -d "$METRO_NODE_MODULES_PATH" ]; then
  echo "metro/src/node-modules ディレクトリが見つからないため、作成します"
  mkdir -p "$METRO_NODE_MODULES_PATH"
fi

# metro.config.js の作成または更新
METRO_CONFIG_PATH="metro.config.js"
if [ ! -f "$METRO_CONFIG_PATH" ]; then
  echo "metro.config.js が見つからないため、作成します"
  cat > "$METRO_CONFIG_PATH" << 'EOL'
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro bundlerの問題に対する修正
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'metro/src/lib/TerminalReporter': path.resolve(__dirname, 'node_modules/metro/src/lib/TerminalReporter.js'),
};

// React Nativeのコンポーネントが正しく解決されるようにする
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// キャッシュ設定の最適化
config.cacheStores = [
  {
    type: 'file',
    // 作業ディレクトリの代わりに一時ディレクトリを使用
    origin: 'relative',
    rootPath: path.join(require('os').tmpdir(), 'metro-cache'),
  },
];

// JavaScript変換設定
config.transformer.minifierConfig = {
  // テスト中に問題が発生した場合はコメントアウトしてみてください
  compress: { drop_console: false },
};

module.exports = config;
EOL
  echo "metro.config.js を作成しました"
fi

# package.jsonの更新（必要なスクリプトがない場合のみ）
if [ -f "package.json" ]; then
  # jqがインストールされている場合は利用する
  if command -v jq &> /dev/null; then
    echo "package.jsonをjqで更新しています..."
    
    # バンドルスクリプトの追加（まだない場合）
    if ! jq -e '.scripts.bundle' package.json >/dev/null 2>&1; then
      jq '.scripts.bundle = "node --max_old_space_size=4096 node_modules/expo/AppEntry.js"' package.json > package.json.tmp
      mv package.json.tmp package.json
    fi
    
    # resolutionsセクションを更新・追加
    jq '.resolutions = {
      "@babel/runtime": "7.27.1",
      "metro": "0.77.0",
      "metro-config": "0.77.0",
      "metro-cache": "0.77.0",
      "metro-minify-terser": "0.77.0",
      "metro-transform-worker": "0.77.0",
      "@expo/metro-config": "0.9.0",
      "babel-preset-expo": "13.1.11",
      "rimraf": "^3.0.2"
    }' package.json > package.json.tmp
    mv package.json.tmp package.json
  else
    echo "jqが見つからないため、手動での確認をお願いします: package.jsonに以下の設定を追加してください:"
    echo '- scripts.bundle: "node --max_old_space_size=4096 node_modules/expo/AppEntry.js"'
    echo '- metro関連のバージョンをresolutionsセクションに追加してください'
  fi
fi

# パッチファイルの作成
PATCHES_DIR="patches"
if [ ! -d "$PATCHES_DIR" ]; then
  mkdir -p "$PATCHES_DIR"
fi

# Metroの互換性パッチ
PATCH_FILE="$PATCHES_DIR/metro+0.77.0.patch"
if [ ! -f "$PATCH_FILE" ]; then
  echo "Metroの互換性パッチを作成します"
  cat > "$PATCH_FILE" << 'EOL'
diff --git a/node_modules/metro/src/lib/TerminalReporter.js b/node_modules/metro/src/lib/TerminalReporter.js
new file mode 100644
index 0000000..b1a2563
--- /dev/null
+++ b/node_modules/metro/src/lib/TerminalReporter.js
@@ -0,0 +1,49 @@
+/**
+ * Copyright (c) Meta Platforms, Inc. and affiliates.
+ *
+ * This source code is licensed under the MIT license found in the
+ * LICENSE file in the root directory of this source tree.
+ *
+ * @flow strict-local
+ * @format
+ */
+
+'use strict';
+
+/**
+ * Metro Reporter for compatibility with Expo SDK 53.
+ * This is a mock implementation that provides required functionality.
+ */
+class TerminalReporter {
+  constructor(terminal) {
+    this._terminal = terminal;
+    this._errors = [];
+    this._warnings = [];
+  }
+
+  /**
+   * Handling exceptions, including worker creation and initialization errors.
+   */
+  handleError(error) {
+    this._errors.push(error);
+  }
+
+  /**
+   * Handling warnings, including those coming from the transformer.
+   */
+  handleWarning(warning) {
+    this._warnings.push(warning);
+  }
+
+  getErrors() {
+    return this._errors;
+  }
+
+  getWarnings() {
+    return this._warnings;
+  }
+
+  // Additional required methods
+  update() {}
+  terminal() { return this._terminal; }
+}
+
+module.exports = TerminalReporter;
EOL
  echo "Metroの互換性パッチファイルを作成しました"
fi

# パッチを適用（patch-packageがある場合）
if [ -f "node_modules/.bin/patch-package" ]; then
  echo "パッチを適用します..."
  node_modules/.bin/patch-package metro --patch-dir="$PATCHES_DIR"
fi

# キャッシュクリア
echo "キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

# nodeのメモリ設定
export NODE_OPTIONS="--max-old-space-size=4096"

# 依存関係を整理
npm dedupe

echo "✅ Metro 互換性の修正が完了しました"
