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
import NetInfo from '@react-native-community/netinfo';
import { useStyle } from '@/contexts/ThemeContext';

interface NetworkTestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export const NetworkDebugScreen: React.FC = () => {
  const { theme } = useStyle();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<NetworkTestResult[]>([]);

  const runNetworkTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: NetworkTestResult[] = [];

    // Test 1: ネットワーク接続状態
    try {
      const netState = await NetInfo.fetch();
      tests.push({
        test: 'ネットワーク接続',
        status: netState.isConnected ? 'success' : 'error',
        message: `接続: ${netState.isConnected ? 'OK' : 'NG'}, タイプ: ${netState.type}`,
        details: netState,
      });
    } catch (error: any) {
      tests.push({
        test: 'ネットワーク接続',
        status: 'error',
        message: error.message,
      });
    }

    // Test 2: Supabase URL到達確認（HTTPSのみ使用）
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ycsydubuirflfuyqfshg.supabase.co';
      console.log('[NetworkDebug] Testing Supabase URL:', supabaseUrl);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
      });
      
      tests.push({
        test: 'Supabase接続',
        status: response.ok ? 'success' : 'error',
        message: `ステータス: ${response.status}`,
        details: {
          url: supabaseUrl,
          status: response.status,
          statusText: response.statusText,
        },
      });
    } catch (error: any) {
      tests.push({
        test: 'Supabase接続',
        status: 'error',
        message: error.message,
        details: error,
      });
    }

    // Test 3: 楽天API到達確認
    try {
      const rakutenUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';
      const response = await fetch(rakutenUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      tests.push({
        test: '楽天API接続',
        status: response.status === 400 ? 'success' : 'error', // パラメータ無しだと400が返る
        message: `ステータス: ${response.status}（パラメータ無しの場合400は正常）`,
        details: {
          url: rakutenUrl,
          status: response.status,
        },
      });
    } catch (error: any) {
      tests.push({
        test: '楽天API接続',
        status: 'error',
        message: error.message,
      });
    }

    // Test 4: Google DNS確認（ネットワーク全般の確認）
    try {
      const response = await fetch('https://dns.google/resolve?name=example.com', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      tests.push({
        test: 'インターネット接続（Google DNS）',
        status: response.ok ? 'success' : 'error',
        message: `ステータス: ${response.status}`,
      });
    } catch (error: any) {
      tests.push({
        test: 'インターネット接続（Google DNS）',
        status: 'error',
        message: error.message,
      });
    }

    // Test 5: 環境変数確認
    const envVars = {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      RAKUTEN_APP_ID: process.env.EXPO_PUBLIC_RAKUTEN_APP_ID ? 'Set' : 'Missing',
    };
    
    tests.push({
      test: '環境変数',
      status: envVars.SUPABASE_URL && envVars.SUPABASE_ANON_KEY !== 'Missing' ? 'success' : 'error',
      message: JSON.stringify(envVars, null, 2),
      details: envVars,
    });

    setResults(tests);
    setIsRunning(false);
  };

  const showDetailedInfo = (result: NetworkTestResult) => {
    Alert.alert(
      result.test,
      `状態: ${result.status}\n\n${result.message || ''}\n\n詳細:\n${
        result.details ? JSON.stringify(result.details, null, 2) : 'なし'
      }`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ネットワーク診断</Text>
      
      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runNetworkTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>テスト実行</Text>
        )}
      </TouchableOpacity>

      {results.map((result, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.resultItem,
            result.status === 'success' && styles.resultSuccess,
            result.status === 'error' && styles.resultError,
          ]}
          onPress={() => showDetailedInfo(result)}
        >
          <Text style={styles.resultTitle}>{result.test}</Text>
          <Text style={styles.resultStatus}>
            {result.status === 'success' ? '✅' : '❌'} {result.status}
          </Text>
          {result.message && (
            <Text style={styles.resultMessage}>{result.message}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>トラブルシューティング</Text>
        <Text style={styles.infoText}>
          • 実機でエラーが出る場合は、Wi-Fi/モバイルデータを確認してください
        </Text>
        <Text style={styles.infoText}>
          • VPNを使用している場合は無効にしてください
        </Text>
        <Text style={styles.infoText}>
          • 企業ネットワークの場合、ファイアウォール設定を確認してください
        </Text>
        <Text style={styles.infoText}>
          • アプリを完全に終了して再起動してください
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  resultError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontFamily: 'Courier',
  },
  infoSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: theme.colors.secondary,
  },
});
