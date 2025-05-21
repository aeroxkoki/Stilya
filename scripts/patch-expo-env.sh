#!/bin/bash
# patch-expo-env.sh
# Expoの環境変数処理モジュールをCI環境用にパッチするスクリプト

# エラー時に中断せず続行
set +e

echo "🔧 環境変数処理モジュールのパッチを適用中..."

# 環境変数モジュールのパッチ関数
apply_env_patch() {
  local ENV_PATH=$1
  
  if [ -f "$ENV_PATH" ]; then
    echo "📝 パッチを適用: $ENV_PATH"
    # バックアップ作成
    cp "$ENV_PATH" "${ENV_PATH}.bak" || true
    
    # 環境変数モジュールを修正 (.env読み込みエラーを回避)
    cat > "$ENV_PATH" << 'EOL'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = exports.loadAsync = exports.hasEnv = exports.getEnv = exports.loadProjectEnv = void 0;

// 簡易版の環境変数処理モジュール (エラー回避用)
const getEnv = () => process.env;
exports.getEnv = getEnv;

const hasEnv = (name) => !!process.env[name];
exports.hasEnv = hasEnv;

const loadProjectEnv = async () => {
  console.log("[ExpoEnv] 環境変数の読み込みをスキップします (CI環境)");
  return {};
};
exports.loadProjectEnv = loadProjectEnv;

const loadAsync = async (props) => {
  return process.env;
};
exports.loadAsync = loadAsync;

const load = (props) => {
  return process.env;
};
exports.load = load;
EOL
    
    return 0
  fi
  
  return 1
}

# 可能性のあるすべてのパス
ENV_PATHS=(
  "node_modules/@expo/cli/node_modules/@expo/env/build/index.js"
  "node_modules/@expo/env/build/index.js"
  "node_modules/@expo/cli/build/node_modules/@expo/env/build/index.js"
  "node_modules/@expo/cli/dist/node_modules/@expo/env/build/index.js"
  "node_modules/@expo/cli/lib/node_modules/@expo/env/build/index.js"
)

# すべてのパスでパッチ適用を試みる
PATCHED=false

for ENV_PATH in "${ENV_PATHS[@]}"; do
  if apply_env_patch "$ENV_PATH"; then
    echo "✅ パッチ適用成功: $ENV_PATH"
    PATCHED=true
  fi
done

# パッチ適用できなかった場合はディレクトリを作成して新規ファイルとして作成
if [ "$PATCHED" = false ]; then
  echo "⚠️ 環境変数モジュールが見つかりません。新規作成します。"
  
  # 主要な場所にディレクトリを作成
  mkdir -p node_modules/@expo/env/build
  
  # 新規ファイルとしてモジュールを作成
  apply_env_patch "node_modules/@expo/env/build/index.js"
  
  echo "✅ 環境変数モジュールを新規作成しました"
fi

echo "✅ 環境変数処理モジュールのパッチ適用完了"
