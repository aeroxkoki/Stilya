import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase, testSupabaseConnection } from '../../services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/env';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message?: string;
}

export const SupabaseConnectionTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runConnectionTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // 1. 環境変数チェック
      addResult({
        name: '環境変数',
        status: SUPABASE_URL && SUPABASE_ANON_KEY ? 'success' : 'error',
        message: SUPABASE_URL && SUPABASE_ANON_KEY 
          ? '✅ 設定済み' 
          : '❌ 未設定 - .envファイルを確認してください',
      });

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        addResult({
          name: 'テスト中止',
          status: 'error',
          message: '環境変数が設定されていないため、テストを中止します',
        });
        setIsRunning(false);
        return;
      }

      // 2. URL形式チェック
      try {
        const url = new URL(SUPABASE_URL);
        addResult({
          name: 'URL形式',
          status: 'success',
          message: `✅ 有効なURL: ${url.hostname}`,
        });
      } catch (error) {
        addResult({
          name: 'URL形式',
          status: 'error',
          message: '❌ 無効なURL形式',
        });
      }

      // 3. 基本接続テスト
      addResult({
        name: '接続テスト',
        status: 'pending',
        message: '接続を確認中...',
      });

      const connectionResult = await testSupabaseConnection();
      setResults(prev => 
        prev.map(r => 
          r.name === '接続テスト' 
            ? {
                ...r,
                status: connectionResult ? 'success' : 'error',
                message: connectionResult 
                  ? '✅ 接続成功' 
                  : '❌ 接続失敗',
              }
            : r
        )
      );

      // 4. REST APIエンドポイントチェック
      addResult({
        name: 'REST API',
        status: 'pending',
        message: 'APIエンドポイントを確認中...',
      });

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
          },
        });
        
        const apiStatus = response.ok || response.status === 401 ? 'success' : 'error';
        const apiMessage = response.ok 
          ? '✅ API正常稼働'
          : response.status === 401
          ? '✅ API稼働中（認証が必要）'
          : `❌ APIエラー: ${response.status} ${response.statusText}`;

        setResults(prev => 
          prev.map(r => 
            r.name === 'REST API' 
              ? { ...r, status: apiStatus, message: apiMessage }
              : r
          )
        );
      } catch (error) {
        setResults(prev => 
          prev.map(r => 
            r.name === 'REST API' 
              ? { 
                  ...r, 
                  status: 'error', 
                  message: `❌ 接続エラー: ${error}` 
                }
              : r
          )
        );
      }

      // 5. 認証状態チェック
      addResult({
        name: '認証状態',
        status: 'pending',
        message: 'セッションを確認中...',
      });

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setResults(prev => 
          prev.map(r => 
            r.name === '認証状態' 
              ? {
                  ...r,
                  status: 'success',
                  message: session 
                    ? `✅ ログイン中: ${session.user.email}` 
                    : '✅ 未ログイン',
                }
              : r
          )
        );
      } catch (error) {
        setResults(prev => 
          prev.map(r => 
            r.name === '認証状態' 
              ? { 
                  ...r, 
                  status: 'error', 
                  message: `❌ エラー: ${error}` 
                }
              : r
          )
        );
      }

      // 6. テーブルアクセステスト
      const tables = ['users', 'products', 'swipes', 'favorites', 'click_logs'];
      
      for (const table of tables) {
        addResult({
          name: `テーブル: ${table}`,
          status: 'pending',
          message: 'アクセス確認中...',
        });

        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          const tableStatus = error ? 'error' : 'success';
          const tableMessage = error 
            ? `❌ ${error.message}` 
            : `✅ アクセス可能 (${count ?? 0}件)`;

          setResults(prev => 
            prev.map(r => 
              r.name === `テーブル: ${table}` 
                ? { ...r, status: tableStatus, message: tableMessage }
                : r
            )
          );
        } catch (err) {
          setResults(prev => 
            prev.map(r => 
              r.name === `テーブル: ${table}` 
                ? { 
                    ...r, 
                    status: 'error', 
                    message: `❌ エラー: ${err}` 
                  }
                : r
            )
          );
        }
      }

    } catch (error) {
      Alert.alert('エラー', `テスト実行中にエラーが発生しました: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusEmoji = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
      default: return '•';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase接続診断</Text>
        <Text style={styles.subtitle}>
          プロジェクトの接続状態を確認します
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
        onPress={runConnectionTests}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.runButtonText}>テスト実行中...</Text>
          </>
        ) : (
          <Text style={styles.runButtonText}>接続テストを実行</Text>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>テスト結果</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultEmoji}>
                  {getStatusEmoji(result.status)}
                </Text>
                <Text style={[
                  styles.resultName,
                  { color: getStatusColor(result.status) }
                ]}>
                  {result.name}
                </Text>
              </View>
              {result.message && (
                <Text style={styles.resultMessage}>{result.message}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>接続情報</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Supabase URL:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {SUPABASE_URL || '未設定'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>API Key:</Text>
          <Text style={styles.infoValue}>
            {SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : '未設定'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  runButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultEmoji: {
    fontSize: 16,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    marginLeft: 24,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'monospace',
  },
});
