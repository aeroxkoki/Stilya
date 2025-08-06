// Development build specific configuration
// This file helps ensure proper development build initialization

module.exports = {
  // Network configuration for development builds
  network: {
    // Use your machine's local IP address
    // This is required for Expo SDK 53 development builds
    useLocalIpAddress: true,
    
    // Fallback to tunnel if local network fails
    fallbackToTunnel: true,
    
    // Timeout for network connections
    connectionTimeout: 30000,
    
    // 開発サーバーのホスト設定
    host: '0.0.0.0',
    
    // ポート番号
    port: 8081,
    
    // HTTPS無効化（開発環境）
    https: false,
    
    // 許可するホスト名
    allowedHosts: [
      'localhost',
      '.local',
      '.ngrok.io',
      '.exp.direct',
      '.expo.dev',
    ],
  },
  
  // Metro bundler configuration
  metro: {
    // Clear cache on startup
    resetCache: true,
    
    // Use watchman for file watching
    useWatchman: true,
    
    // Maximum workers for bundling
    maxWorkers: 4,
    
    // アセットの最適化
    assetPlugins: [],
    
    // ソースマップの生成
    sourceMapUrl: true,
    
    // バンドルの最適化設定
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  
  // Development client configuration
  devClient: {
    // Disable silent launch for better debugging
    silentLaunch: false,
    
    // Show development menu
    showDevMenu: true,
    
    // Enable fast refresh
    fastRefresh: true,
    
    // Hermes engine configuration
    hermes: {
      enabled: true,
      // Enable debugging
      debugger: true,
    },
    
    // 実機デバッグ用の追加設定
    remoteDebugging: {
      enabled: true,
      // Chrome DevToolsを使用
      useChrome: true,
      // デバッグポート
      debuggerPort: 8083,
    },
  },
  
  // Error handling
  errorHandling: {
    // Show error overlay
    showErrorOverlay: true,
    
    // Log errors to console
    logErrors: true,
    
    // Report crashes
    reportCrashes: true,
    
    // スタックトレースの詳細表示
    verboseErrors: true,
  },
  
  // 開発ビルド固有の設定
  buildSettings: {
    // 開発クライアントのバージョン
    developmentClientVersion: '5.1.8',
    
    // EAS Build設定との同期
    syncWithEAS: true,
    
    // キャッシュ設定
    cache: {
      // キャッシュディレクトリ
      directory: '.expo/cache',
      // キャッシュのTTL（秒）
      ttl: 3600,
    },
    
    // アプリ起動時の設定
    startup: {
      // 起動画面の表示時間（ミリ秒）
      splashDuration: 2000,
      // 自動リロードの有効化
      autoReload: true,
      // エラー時の自動リトライ
      autoRetry: true,
    },
  },
  
  // プラットフォーム固有の設定
  platform: {
    ios: {
      // iOSシミュレーターの設定
      simulator: {
        // デフォルトデバイス
        device: 'iPhone 15',
        // OSバージョン
        osVersion: '17.0',
      },
      // 実機テストの設定
      device: {
        // コード署名の設定
        codeSigningRequired: true,
        // プロビジョニングプロファイル
        provisioningProfile: 'automatic',
      },
    },
    android: {
      // エミュレーターの設定
      emulator: {
        // デフォルトデバイス
        device: 'Pixel_7_API_33',
        // AVDの自動起動
        autoLaunch: true,
      },
      // 実機テストの設定
      device: {
        // USBデバッグの有効化確認
        checkUsbDebugging: true,
        // インストール時の設定
        installFlags: ['-r', '-d'],
      },
    },
  },
};
