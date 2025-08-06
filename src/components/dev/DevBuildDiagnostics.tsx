import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import Constants from 'expo-constants';
import * as Network from 'expo-network';
import { supabase } from '../../services/supabase';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export const DevBuildDiagnostics: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // 1. 開発ビルドの確認
      setCurrentTest('開発ビルドの確認');
      const isDevelopmentBuild = Constants.appOwnership !== 'expo';
      setResults(prev => [...prev, {
        name: '開発ビルドの確認',
        status: isDevelopmentBuild ? 'success' : 'error',
        message: isDevelopmentBuild ? '開発ビルドで実行中' : 'Expo Goで実行中（開発ビルドではありません）',
        details: {
          appOwnership: Constants.appOwnership,
          expoVersion: Constants.expoVersion,
          platform: Platform.OS,
        }
      }]);

      // 2. ネットワーク接続の確認
      setCurrentTest('ネットワーク接続の確認');
      const networkState = await Network.getNetworkStateAsync();
      setResults(prev => [...prev, {
        name: 'ネットワーク接続',
        status: networkState.isConnected ? 'success' : 'error',
        message: networkState.isConnected ? 'インターネットに接続されています' : 'インターネット接続がありません',
        details: {
          type: networkState.type,
          isConnected: networkState.isConnected,
          isInternetReachable: networkState.isInternetReachable,
        }
      }]);

      // 3. 開発サーバーへの接続確認
      setCurrentTest('開発サーバーへの接続確認');
      try {
        // Metro bundlerのステータスを確認
        const bundlerUrl = `http://${getServerUrl()}:8081/status`;
        const response = await fetch(bundlerUrl, { 
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
          // タイムアウトを設定
          signal: AbortSignal.timeout(5000),
        });
        
        setResults(prev => [...prev, {
          name: '開発サーバー接続',
          status: response.ok ? 'success' : 'warning',
          message: response.ok ? 'Metro Bundlerに接続できました' : 'Metro Bundlerへの接続に問題があります',
          details: {
            url: bundlerUrl,
            status: response.status,
          }
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          name: '開発サーバー接続',
          status: 'error',
          message: 'Metro Bundlerに接続できません',
          details: {
            error: error.message,
            hint: '開発サーバーが起動していることを確認してください',
          }
        }]);
      }

      // 4. Supabase接続の確認
      setCurrentTest('Supabase接続の確認');
      try {
        const { data, error } = await supabase
          .from('products')
          .select('count')
          .limit(1);

        setResults(prev => [...prev, {
          name: 'Supabase接続',
          status: error ? 'error' : 'success',
          message: error ? `Supabaseへの接続に失敗: ${error.message}` : 'Supabaseに正常に接続できました',
          details: {
            url: process.env.EXPO_PUBLIC_SUPABASE_URL,
            error: error?.message,
          }
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          name: 'Supabase接続',
          status: 'error',
          message: 'Supabaseへの接続テストに失敗しました',
          details: {
            error: error.message,
          }
        }]);
      }

      // 5. 環境変数の確認
      setCurrentTest('環境変数の確認');
      const envVars = {
        SUPABASE_URL: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        RAKUTEN_APP_ID: !!process.env.EXPO_PUBLIC_RAKUTEN_APP_ID,
      };

      const allEnvVarsSet = Object.values(envVars).every(v => v);
      setResults(prev => [...prev, {
        name: '環境変数',
        status: allEnvVarsSet ? 'success' : 'warning',
        message: allEnvVarsSet ? 'すべての環境変数が設定されています' : '一部の環境変数が設定されていません',
        details: envVars,
      }]);

      // 6. メモリ使用量の確認
      setCurrentTest('メモリ使用量の確認');
      if (global.performance && global.performance.memory) {
        const memory = global.performance.memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        setResults(prev => [...prev, {
          name: 'メモリ使用量',
          status: usagePercent < 80 ? 'success' : 'warning',
          message: `メモリ使用率: ${usagePercent.toFixed(1)}%`,
          details: {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
          }
        }]);
      }

    } catch (error) {
      Alert.alert('診断エラー', `診断中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getServerUrl = (): string => {
    // 開発サーバーのURLを取得
    if (Constants.manifest?.debuggerHost) {
      return Constants.manifest.debuggerHost.split(':')[0];
    }
    if (Constants.manifest2?.extra?.expoGo?.debuggerHost) {
      return Constants.manifest2.extra.expoGo.debuggerHost.split(':')[0];
    }
    return 'localhost';
  };

  const getStatusColor = (status: DiagnosticResult['status']): string => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#999';
    }
  };

  const exportResults = () => {
    const report = results.map(r => `
${r.name}
状態: ${r.status}
メッセージ: ${r.message}
詳細: ${JSON.stringify(r.details, null, 2)}
---`).join('\n');

    Alert.alert(
      '診断結果',
      '診断結果をコピーしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'コピー', 
          onPress: () => {
            // React Nativeではクリップボードアクセスが必要
            Alert.alert('診断結果', report);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>開発ビルド診断</Text>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>診断を実行</Text>
          )}
        </TouchableOpacity>
      </View>

      {currentTest ? (
        <View style={styles.currentTest}>
          <Text style={styles.currentTestText}>実行中: {currentTest}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <View 
                style={[
                  styles.statusIndicator, 
                  { backgroundColor: getStatusColor(result.status) }
                ]} 
              />
              <Text style={styles.resultName}>{result.name}</Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
            {result.details && (
              <View style={styles.resultDetails}>
                <Text style={styles.detailsText}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {results.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={exportResults}
        >
          <Text style={styles.buttonText}>結果をエクスポート</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentTest: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    alignItems: 'center',
  },
  currentTestText: {
    color: '#1976D2',
    fontSize: 14,
  },
  results: {
    flex: 1,
    padding: 20,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultDetails: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333',
  },
  exportButton: {
    margin: 20,
    backgroundColor: '#4CAF50',
  },
});