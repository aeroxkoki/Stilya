#!/bin/bash

# ========================================
# metro-config 互換性スクリプト
# GitHub Actions環境用 - Expo SDK 53
# ========================================

echo "🔧 metro-config 互換モジュールをセットアップ中..."

# シンボリックリンクの作成
echo "🔗 シンボリックリンクの確認および作成"
mkdir -p node_modules/@expo/cli/node_modules
ln -sf ../../../node_modules/metro-config node_modules/@expo/cli/node_modules/metro-config
ln -sf ../../../node_modules/metro-core node_modules/@expo/cli/node_modules/metro-core

# 再度リンクを確認
if [ ! -d "node_modules/@expo/cli/node_modules/metro-config" ]; then
  echo "⚠️ リンクが作成されていません。別の方法を試みます..."
  
  # 互換モジュールの作成
  mkdir -p node_modules/@expo/cli/node_modules/metro-config
  
  cat > node_modules/@expo/cli/node_modules/metro-config/package.json << 'EOL'
{
  "name": "metro-config",
  "version": "0.77.0",
  "description": "🚇 Metro Config compatibility layer for Expo SDK 53",
  "main": "src/index.js",
  "license": "MIT"
}
EOL

  mkdir -p node_modules/@expo/cli/node_modules/metro-config/src
  
  cat > node_modules/@expo/cli/node_modules/metro-config/src/index.js << 'EOL'
/**
 * Metro Config compatibility module for Expo SDK 53
 * Created for GitHub Actions build environment
 */

// 他のmetro-configモジュールがあれば、そちらを使う
try {
  const originalModule = require('../../../../../metro-config');
  module.exports = originalModule;
} catch (error) {
  // 存在しない場合は代替実装を提供
  const defaults = {
    resolver: {
      sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
      assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      platforms: ['ios', 'android', 'web'],
      providesModuleNodeModules: [],
    },
    transformer: {
      assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
      asyncRequireModulePath: 'metro-runtime/src/modules/asyncRequire',
      babelTransformerPath: 'metro-react-native-babel-transformer',
      getTransformOptions: () => ({}),
    },
    serializer: {
      getModulesRunBeforeMainModule: () => [],
      getPolyfills: () => [],
      createModuleIdFactory: () => (path) => path,
    },
    cacheStores: [],
    reporter: null,
    maxWorkers: 2,
    resetCache: false,
  };

  // シンプルな設定生成関数
  function getDefaultConfig() {
    return { ...defaults };
  }

  module.exports = {
    getDefaultConfig,
    mergeConfig: (configA, configB) => ({ ...configA, ...configB }),
    loadConfig: async () => ({ ...defaults }),
  };
}
EOL
fi

echo "✅ metro-config モジュールのセットアップ完了"
