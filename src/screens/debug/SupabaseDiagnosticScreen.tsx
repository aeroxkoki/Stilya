import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase, testSupabaseConnection } from '@/services/supabase';
import { fetchProducts } from '@/services/productService';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import { useStyle } from '@/contexts/ThemeContext';

export const DebugSupabaseScreen: React.FC = () => {
  const { theme } = useStyle();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  
  const runDiagnostics = async () => {
    setLoading(true);
    const diagnosticResults: any = {};
    
    try {
      // 1. 環境変数チェック
      diagnosticResults.env = {
        url: SUPABASE_URL ? `✅ Set (${SUPABASE_URL.substring(0, 30)}...)` : '❌ Missing',
        key: SUPABASE_ANON_KEY ? `✅ Set (${SUPABASE_ANON_KEY.length} chars)` : '❌ Missing'
      };
      
      // 2. 基本的な接続テスト
      const connectionTest = await testSupabaseConnection();
      diagnosticResults.connection = connectionTest ? '✅ Connected' : '❌ Failed';
      
      // 3. セッション状態
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      diagnosticResults.session = {
        status: sessionError ? `❌ Error: ${sessionError.message}` : '✅ OK',
        user: sessionData?.session?.user?.email || 'Not logged in'
      };
      
      // 4. external_productsテーブルへの直接アクセス
      const { data: directData, error: directError, count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact' })
        .limit(5);
        
      diagnosticResults.directAccess = {
        status: directError ? `❌ Error: ${directError.message}` : '✅ Success',
        count: count || 0,
        sample: directData?.[0]?.title || 'No data'
      };
      
      // 5. productServiceからの取得
      const serviceResult = await fetchProducts(5, 0);
      diagnosticResults.serviceAccess = {
        success: serviceResult.success,
        dataLength: serviceResult.data?.length || 0,
        error: serviceResult.error || 'None'
      };
      
      // 6. アプリクエリのシミュレーション
      const { data: appData, error: appError } = await supabase
        .from('external_products')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(10);
        
      diagnosticResults.appQuery = {
        status: appError ? `❌ Error: ${appError.message}` : '✅ Success',
        count: appData?.length || 0
      };
      
    } catch (error: any) {
      diagnosticResults.error = error.message || 'Unknown error';
    }
    
    setResults(diagnosticResults);
    setLoading(false);
  };
  
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const renderResult = (title: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <View style={[styles.section, { shadowColor: theme.colors.card.shadow }]}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {Object.entries(value).map(([key, val]) => (
            <Text key={key} style={[styles.resultText, { color: theme.colors.text.primary }]}>
              {key}: {String(val)}
            </Text>
          ))}
        </View>
      );
    }
    
    return (
      <View style={[styles.section, { shadowColor: theme.colors.card.shadow }]}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={[styles.resultText, { color: theme.colors.text.primary }]}>{String(value)}</Text>
      </View>
    );
  };
  
  const showSolution = () => {
    Alert.alert(
      '解決策',
      '以下を確認してください：\n\n' +
      '1. .envファイルに正しい環境変数が設定されているか\n' +
      '2. アプリを完全に再起動したか（Expo Goの場合は再読み込み）\n' +
      '3. Supabaseダッシュボードでテーブルが存在するか\n' +
      '4. RLSポリシーが適切に設定されているか',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Supabase診断</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runDiagnostics}
          disabled={loading}
        >
          <Text style={styles.buttonText}>再診断</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>診断中...</Text>
        </View>
      ) : (
        <>
          {renderResult('環境変数', results.env)}
          {renderResult('接続状態', results.connection)}
          {renderResult('セッション', results.session)}
          {renderResult('直接アクセス', results.directAccess)}
          {renderResult('サービス経由', results.serviceAccess)}
          {renderResult('アプリクエリ', results.appQuery)}
          
          {results.error && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>エラー</Text>
              <Text style={styles.errorText}>{results.error}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.solutionButton]} 
            onPress={showSolution}
          >
            <Text style={styles.buttonText}>解決策を表示</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',  // theme.colors.surface の代わりに固定値
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    // color はインラインスタイルで適用
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',  // theme.colors.primary の代わりに固定値
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    // color はインラインスタイルで適用する必要がある場合に対応
    marginVertical: 2,
  },
  errorSection: {
    backgroundColor: '#FFE4E1',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC143C',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#8B0000',
  },
  solutionButton: {
    backgroundColor: '#28A745',
    marginBottom: 30,
  },
});
