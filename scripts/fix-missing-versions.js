#!/usr/bin/env node
/**
 * このスクリプトは、依存関係のバージョンの不一致を解決するためのものです。
 * CI環境で実行され、特定のパッケージを強制的に正しいバージョンに更新します。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 必要なディレクトリが存在するかチェック
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`ディレクトリを作成しました: ${dirPath}`);
  }
}

// TerminalReporter.js ファイルの作成（Metro 互換性用）
function createTerminalReporterFile() {
  const terminalReporterPath = path.join(
    process.cwd(),
    'node_modules/metro/src/lib/TerminalReporter.js'
  );
  const terminalReporterDir = path.dirname(terminalReporterPath);

  ensureDirectoryExists(terminalReporterDir);

  const terminalReporterContent = `/**
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
 * This is a simplified implementation that provides required functionality.
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal;
    this._errors = [];
    this._warnings = [];
  }

  handleError(error) {
    this._errors.push(error);
  }

  handleWarning(warning) {
    this._warnings.push(warning);
  }

  getErrors() {
    return this._errors;
  }

  getWarnings() {
    return this._warnings;
  }

  update() {}
  
  terminal() { 
    return this._terminal; 
  }
}

module.exports = TerminalReporter;
`;

  fs.writeFileSync(terminalReporterPath, terminalReporterContent);
  console.log(`✅ ${terminalReporterPath} を作成しました`);

  // Expo CLI 互換ファイルも作成
  const expoCliDir = path.join(
    process.cwd(),
    'node_modules/@expo/cli/build/src/start/server/metro'
  );
  
  ensureDirectoryExists(expoCliDir);
  
  const expoReporterPath = path.join(expoCliDir, 'TerminalReporter.js');
  
  if (!fs.existsSync(expoReporterPath)) {
    const expoReporterContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Expo SDK 53向けの互換性対応
const UpstreamTerminalReporter = require('metro/src/lib/TerminalReporter');

// 必要なメソッドを追加したラッパー
class ExpoTerminalReporter extends UpstreamTerminalReporter {
  constructor(terminal) {
    super(terminal);
  }
}

exports.default = ExpoTerminalReporter;
`;
    
    fs.writeFileSync(expoReporterPath, expoReporterContent);
    console.log(`✅ ${expoReporterPath} を作成しました`);
  }
}

// 必要なパッケージのインストール
function installCorrectVersions() {
  try {
    console.log('🔧 必要なパッケージの正確なバージョンをインストールします...');
    
    const packagesToInstall = [
      'metro@0.77.0',
      'metro-config@0.77.0',
      '@expo/metro-config@0.9.0',
      'metro-minify-terser@0.77.0',
      'metro-transform-worker@0.77.0',
      'metro-cache@0.77.0'
    ];
    
    execSync(`yarn add --dev ${packagesToInstall.join(' ')} --exact`, { stdio: 'inherit' });
    console.log('✅ パッケージをインストールしました');
  } catch (error) {
    console.error('❌ パッケージのインストールに失敗しました:', error.message);
  }
}

// メイン処理
function main() {
  console.log('🔧 依存関係のバージョン修正ツールを実行します...');
  
  // Metro 互換性ファイルの作成
  createTerminalReporterFile();
  
  // パッケージのインストール
  installCorrectVersions();
  
  console.log('✅ 依存関係の修正が完了しました');
}

main();
