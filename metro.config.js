/**
 * Metro configuration for React Native with Expo SDK 53
 * https://facebook.github.io/metro/docs/configuration
 * 
 * @type {import('metro-config').MetroConfig}
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// ========================================
// Resolver設定（モジュール解決）
// ========================================
config.resolver = {
  ...config.resolver,
  
  // パスエイリアスの設定
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@screens': path.resolve(__dirname, 'src/screens'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@contexts': path.resolve(__dirname, 'src/contexts'),
    '@navigation': path.resolve(__dirname, 'src/navigation'),
    '@types': path.resolve(__dirname, 'src/types'),
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@constants': path.resolve(__dirname, 'src/constants'),
  },
  
  // ソースファイルの拡張子
  sourceExts: [
    ...config.resolver.sourceExts,
    'cjs',  // CommonJSモジュールのサポート
    'mjs',  // ESモジュールのサポート
  ],
  
  // アセットファイルの拡張子
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  
  // Node.jsモジュールのディレクトリ
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  
  // プラットフォーム固有の拡張子
  platforms: ['ios', 'android'],
  
  // モジュール解決の最適化
  unstable_enableSymlinks: true,
  unstable_enablePackageExports: true,
  
  // Hermesエンジン用の最適化
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  
  // 重複モジュールの解決
  resolveRequest: (context, moduleName, platform) => {
    // react-native-reanimatedの重複を防ぐ
    if (moduleName === 'react-native-reanimated') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/react-native-reanimated/lib/index.js'),
        type: 'sourceFile',
      };
    }
    
    // デフォルトの解決方法を使用
    return context.resolveRequest(context, moduleName, platform);
  },
};

// ========================================
// Transformer設定（トランスパイル）
// ========================================
config.transformer = {
  ...config.transformer,
  
  // Babel設定の最適化
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  
  // アセット処理の設定
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  
  // Hermesパーサーを有効化
  hermesParser: true,
  
  // Minifierの設定（Hermesエンジン最適化）
  minifierConfig: {
    keep_fnames: true,  // 関数名を保持（デバッグ用）
    mangle: {
      keep_fnames: true,  // 関数名を保持
    },
    compress: {
      drop_console: process.env.NODE_ENV === 'production',  // 本番環境でconsole.logを削除
    },
  },
  
  // トランスフォームオプション
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,  // パフォーマンス向上のため
      nonInlinedRequires: [
        // これらのモジュールはインライン化しない
        'React',
        'react',
        'react-native',
      ],
    },
  }),
  
  // アセットレジストリのパス
  assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
};

// ========================================
// Serializer設定（バンドル生成）
// ========================================
config.serializer = {
  ...config.serializer,
  
  // ソースマップの生成
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
  
  // Polyfillsの設定
  getPolyfills: () => require('react-native/rn-get-polyfills')(),
};

// ========================================
// Server設定（開発サーバー）
// ========================================
config.server = {
  ...config.server,
  
  // 開発サーバーのポート
  port: 8081,
  
  // ホットリロードを有効化
  enhanceMiddleware: (middleware) => {
    return middleware;
  },
};

// ========================================
// Watcher設定（ファイル監視）
// ========================================
config.watchFolders = [
  path.resolve(__dirname),
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'node_modules'),
];

config.watcher = {
  ...config.watcher,
  
  // Watchmanの設定
  watchman: {
    // より大きなファイルの監視を許可
    'defer-states': ['allow_large_files'],
  },
};

// ========================================
// キャッシュ設定
// ========================================
config.cacheStores = [
  {
    // FileStoreキャッシュ
    FileStore: {
      root: path.join(__dirname, '.metro-cache'),
    },
  },
];

// 開発環境でのキャッシュリセット
if (process.env.NODE_ENV !== 'production') {
  config.resetCache = true;
}

// ========================================
// パフォーマンス最適化
// ========================================
config.maxWorkers = 4;  // ワーカー数の制限（メモリ使用量を抑える）

// ========================================
// 環境変数のログ出力（デバッグ用）
// ========================================
if (process.env.DEBUG_METRO) {
  console.log('Metro Configuration:', JSON.stringify(config, null, 2));
}

module.exports = config;
