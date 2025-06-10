import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { testSupabaseConnection, supabase, checkNetworkConnection } from '@/services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_LOCAL_SUPABASE } from '@/utils/env';
import { useNetwork } from '@/contexts/NetworkContext';
import NetInfo from '@react-native-community/netinfo';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'failure';
  message?: string;
  details?: any;
}

export const ConnectionDiagnostics: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { isConnected, isInternetReachable, connectionType } = useNetwork();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // 1. 環境変数チェック
    testResults.push({
      test: '環境変数チェック',
      status: SUPABASE_URL && SUPABASE_ANON_KEY ? 'success' : 'failure',
      message: SUPABASE_URL && SUPABASE_ANON_KEY 
        ? `URL: ${SUPABASE_URL}` 
        : '環境変数が設定されていません',
      details: {
        url: SUPABASE_URL || 'Not set',
        key: SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        isLocal: IS_LOCAL_SUPABASE,
      }
    });

    // 2. ネットワーク状態チェック
    const netState = await NetInfo.fetch();
    testResults.push({
      test: 'ネットワーク接続',
      status: netState.isConnected ? 'success' : 'failure',
      message: `接続: ${netState.isConnected ? 'あり' : 'なし'}, タイプ: ${netState.type}`,
      details: {
        isConnected: netState.isConnected,
        isInternetReachable: netState.isInternetReachable,
        type: netState.type,
        details: netState.details,
      }
    });

    // 3. インターネット到達性チェック
    testResults.push({
      test: 'インターネット到達性',
      status: netState.isInternetReachable ? 'success' : netState.isInternetReachable === false ? 'failure' : 'pending',
      message: netState.isInternetReachable ? 'インターネットに接続可能' : 
               netState.isInternetReachable === false ? 'インターネットに接続できません' : '確認中',
      details: {
        isInternetReachable: netState.isInternetReachable,
      }
    });

    // 4. Supabase URL アクセステスト
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      testResults.push({
        test: 'Supabase URL到達性',
        status: response.ok || response.status === 401 ? 'success' : 'failure',
        message: `ステータス: ${response.status}`,
        details: {
          url: SUPABASE_URL,
          status: response.status,
          statusText: response.statusText,
        }
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase URL到達性',
        status: 'failure',
        message: `エラー: ${error.message}`,
        details: { error: error.message }
      });
    }

    // 5. Supabase認証テスト
    try {
      const connected = await testSupabaseConnection();
      testResults.push({
        test: 'Supabase認証',
        status: connected ? 'success' : 'failure',
        message: connected ? '認証成功' : '認証失敗',
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase認証',
        status: 'failure',
        message: `エラー: ${error.message}`,
        details: { error }
      });
    }

    // 6. データベース接続テスト
    try {
      const { data, error } = await supabase
        .from('external_products')
        .select('id')
        .limit(1);
      
      testResults.push({
        test: 'データベース接続',
        status: error ? 'failure' : 'success',
        message: error ? `エラー: ${error.message}` : 'データベース接続成功',
        details: { data, error }
      });
    } catch (error: any) {
      testResults.push({
        test: 'データベース接続',
        status: 'failure',
        message: `エラー: ${error.message}`,
        details: { error }
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const exportResults = () => {
    const report = results.map(r => 
      `${r.test}: ${r.status} - ${r.message}\n詳細: ${JSON.stringify(r.details, null, 2)}`
    ).join('\n\n');
    
    Alert.alert(
      '診断結果',
      report,
      [
        { text: 'OK' },
        { text: 'コピー', onPress: () => console.log('Copy to clipboard:', report) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>接続診断ツール</Text>
        <Text style={styles.subtitle}>
          現在の接続状態: {isConnected ? '接続中' : '未接続'} ({connectionType})
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runDiagnostics}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>診断を開始</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <>
          <View style={styles.results}>
            {results.map((result, index) => (
              <View key={index} style={[styles.resultItem, styles[result.status]]}>
                <Text style={styles.resultTitle}>{result.test}</Text>
                <Text style={styles.resultStatus}>{result.status.toUpperCase()}</Text>
                {result.message && (
                  <Text style={styles.resultMessage}>{result.message}</Text>
                )}
                {result.details && __DEV__ && (
                  <Text style={styles.resultDetails}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.exportButton} onPress={exportResults}>
            <Text style={styles.buttonText}>結果をエクスポート</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    marginBottom: 20,
  },
  resultItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  success: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#4caf50',
  },
  failure: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  pending: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#ff9800',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    color: '#333',
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  exportButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});
