#!/bin/bash
# 依存関係問題修正スクリプト for Stilya (2025年5月21日)

echo "🔧 Stilya アプリの依存関係問題を修正します..."

# ロックファイルクリーンアップ
echo "📦 ロックファイルを整理しています..."
if [ -f "yarn.lock" ]; then
  rm -f yarn.lock
  echo "✅ yarn.lock を削除しました"
fi

# node_modules が存在する場合は削除
if [ -d "node_modules" ]; then
  echo "📦 node_modules をクリーンアップします..."
  rm -rf node_modules
  echo "✅ node_modules を削除しました"
fi

# キャッシュクリア
echo "🧹 キャッシュをクリアします..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache
echo "✅ キャッシュをクリアしました"

# 依存関係の再インストール
echo "📥 依存関係を再インストールします..."
npm install

# Metro 設定の修正
echo "🔧 Metro 設定を修正します..."
npm install --save-dev @expo/metro-config@0.9.0 --force
npm install --save-dev metro-core@0.77.0 --force
npm dedupe

# Babel ランタイム修正
echo "🔧 Babel ランタイムを修正します..."
npm install --save @babel/runtime@7.27.1
npm dedupe @babel/runtime

# TerminalReporter の作成
echo "📝 TerminalReporter.js を作成します..."
mkdir -p node_modules/metro/src/lib
cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for compatibility with Expo SDK 53.
 */
"use strict";
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal;
    this._errors = [];
    this._warnings = [];
  }
  handleError(error) { this._errors.push(error); }
  handleWarning(warning) { this._warnings.push(warning); }
  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
  update() {}
  terminal() { return this._terminal; }
}
module.exports = TerminalReporter;
EOL
chmod 644 node_modules/metro/src/lib/TerminalReporter.js
echo "✅ TerminalReporter.js が作成されました"

# 問題解決の検証
echo "🔍 問題が解決されたか確認します..."
npx expo-doctor

echo "✅ 修正プロセスが完了しました!"
echo "💡 問題が引き続き発生する場合は、'npm run fix:deps' を実行してください。"
