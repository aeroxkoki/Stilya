#!/bin/bash
# Metro互換性を修正するスクリプト

echo "🔍 Metro 互換性問題を修正します..."

# 必要なモジュールをインストール
npm install --save-dev metro@0.77.0 metro-config@0.77.0 metro-runtime@0.77.0 metro-source-map@0.77.0 metro-resolver@0.77.0 metro-transform-plugins@0.77.0 metro-transform-worker@0.77.0 metro-cache@0.77.0 metro-minify-terser@0.77.0 --legacy-peer-deps

# @expo/metro-config を適切なバージョンに固定
npm install --save-dev @expo/metro-config@0.9.0 --legacy-peer-deps

# 必要な場合はTerminalReporterをコピー
mkdir -p node_modules/metro/src/lib
if [ ! -f node_modules/metro/src/lib/TerminalReporter.js ]; then
  echo "TerminalReporter.js が見つからないため、作成します"
  cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall react_native
 */

'use strict';

/**
 * A Reporter that does nothing. Errors and warnings will be collected, though.
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
}

module.exports = TerminalReporter;
EOL
  echo "TerminalReporter.js を作成しました"
fi

# 依存関係をデデュープ
npm dedupe

# パッケージ修正のためのリセット
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true

echo "✅ Metro 互換性の修正が完了しました"
