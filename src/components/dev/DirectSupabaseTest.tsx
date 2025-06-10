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
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'failure';
  message?: string;
  details?: any;
}

export const DirectSupabaseTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runDirectTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // 1. 基本的なfetchテスト
    try {
      console.log('[DirectTest] Testing basic fetch...');
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();
      
      testResults.push({
        test: '基本的なfetchテスト',
        status: 'success',
        message: 'JSONPlaceholder APIに接続成功',
        details: { status: response.status }
      });
    } catch (error: any) {
      testResults.push({
        test: '基本的なfetchテスト',
        status: 'failure',
        message: error.message,
        details: { error }
      });
    }

    // 2. Supabase Health Check
    try {
      const healthUrl = `${SUPABASE_URL}/rest/v1/`;
      console.log('[DirectTest] Testing Supabase health:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
        },
      });
      
      testResults.push({
        test: 'Supabase Health Check',
        status: response.status === 200 || response.status === 401 ? 'success' : 'failure',
        message: `ステータス: ${response.status}`,
        details: { 
          url: healthUrl,
          status: response.status,
          statusText: response.statusText 
        }
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase Health Check',
        status: 'failure',
        message: error.message,
        details: { error: error.message }
      });
    }

    // 3. Supabase Auth エンドポイント
    try {
      const authUrl = `${SUPABASE_URL}/auth/v1/health`;
      console.log('[DirectTest] Testing auth endpoint:', authUrl);
      
      const response = await fetch(authUrl);
      const text = await response.text();
      
      testResults.push({
        test: 'Supabase Auth Health',
        status: response.ok ? 'success' : 'failure',
        message: `ステータス: ${response.status}`,
        details: { 
          url: authUrl,
          status: response.status,
          response: text 
        }
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase Auth Health',
        status: 'failure',
        message: error.message,
        details: { error: error.message }
      });
    }

    // 4. Supabase直接クエリテスト
    try {
      const queryUrl = `${SUPABASE_URL}/rest/v1/external_products?select=id&limit=1`;
      console.log('[DirectTest] Testing direct query:', queryUrl);
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      testResults.push({
        test: 'Supabase直接クエリ',
        status: response.ok ? 'success' : 'failure',
        message: `ステータス: ${response.status}`,
        details: { 
          url: queryUrl,
          status: response.status,
          data: data 
        }
      });
    } catch (error: any) {
      testResults.push({
        test: 'Supabase直接クエリ',
        status: 'failure',
        message: error.message,
        details: { error: error.message }
      });
    }

    // 5. XMLHttpRequestテスト
    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${SUPABASE_URL}/rest/v1/`);
        xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
        
        xhr.onload = () => {
          testResults.push({
            test: 'XMLHttpRequestテスト',
            status: xhr.status === 200 || xhr.status === 401 ? 'success' : 'failure',
            message: `ステータス: ${xhr.status}`,
            details: { 
              status: xhr.status,
              statusText: xhr.statusText 
            }
          });
          resolve(null);
        };
        
        xhr.onerror = () => {
          testResults.push({
            test: 'XMLHttpRequestテスト',
            status: 'failure',
            message: 'XMLHttpRequest failed',
            details: { error: 'Network error' }
          });
          reject(new Error('XMLHttpRequest failed'));
        };
        
        xhr.send();
      });
    } catch (error: any) {
      testResults.push({
        test: 'XMLHttpRequestテスト',
        status: 'failure',
        message: error.message,
        details: { error: error.message }
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>直接接続テスト</Text>
        <Text style={styles.subtitle}>
          Supabase SDKを使用せずに直接HTTPリクエストをテスト
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={runDirectTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>テストを開始</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
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
    fontSize: 14,
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
});
