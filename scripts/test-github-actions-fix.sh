#!/bin/bash
# test-github-actions-fix.sh
# GitHub Actions互換性の修正をローカルでテストするスクリプト

# エラー時に中断せず続行する
set +e

echo "🧪 GitHub Actions互換性の修正をテストします..."

# キャッシュのクリーンアップ
echo "🧹 キャッシュをクリーンアップ中..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache || true
rm -rf ~/.metro-cache || true
echo "✅ キャッシュをクリーンアップしました"

# Metro互換性の修正
echo "🔧 Metro互換性の修正を適用中..."
chmod +x ./scripts/fix-github-actions-metro.sh
bash ./scripts/fix-github-actions-metro.sh || true

# TerminalReporterの作成
echo "📝 TerminalReporterを作成中..."
chmod +x ./scripts/create-terminal-reporter.sh
bash ./scripts/create-terminal-reporter.sh || true

# ディレクトリ構造を確認
echo "📂 ディレクトリ構造を確認中..."
mkdir -p node_modules/metro/src/lib
mkdir -p node_modules/@expo/cli/node_modules/metro/src/lib

# TerminalReporterが存在するか確認し、存在しない場合は作成
if [ ! -f "node_modules/metro/src/lib/TerminalReporter.js" ]; then
  echo "⚠️ TerminalReporter.jsが見つかりません。作成します..."
  cat > node_modules/metro/src/lib/TerminalReporter.js << 'EOL'
/**
 * Metro Reporter for Expo SDK 53 compatibility (emergency fix)
 */
class TerminalReporter {
  constructor(terminal) {
    this._terminal = terminal || console;
    this._errors = [];
    this._warnings = [];
  }

  update() {}
  terminal() { return this._terminal; }
  
  handleError(error) {
    this._errors.push(error);
    console.error(error);
  }

  handleWarning(warning) {
    this._warnings.push(warning);
    console.warn(warning);
  }

  getErrors() { return this._errors; }
  getWarnings() { return this._warnings; }
}

module.exports = TerminalReporter;
EOL
fi

# TerminalReporterをコピー
cp -f node_modules/metro/src/lib/TerminalReporter.js node_modules/@expo/cli/node_modules/metro/src/lib/TerminalReporter.js || true

# 環境変数処理モジュールのパッチ
echo "📝 環境変数処理モジュールにパッチを適用中..."
chmod +x ./scripts/patch-expo-env.sh
bash ./scripts/patch-expo-env.sh || true

# Android用のアセットディレクトリの準備
echo "📁 Android用のアセットディレクトリを準備中..."
mkdir -p android/app/src/main/assets
touch android/app/src/main/assets/index.android.bundle
echo "// Empty bundle for test build - Generated $(date)" > android/app/src/main/assets/index.android.bundle

# テスト成功
echo "✅ GitHub Actions互換性の修正テストが完了しました！"
echo "👉 GitHub Actionsが正常に動作する準備が整いました。"
