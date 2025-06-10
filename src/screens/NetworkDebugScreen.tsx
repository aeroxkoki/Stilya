import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { testSupabaseConnection, supabase } from '../services/supabase';
import { SUPABASE_URL } from '../utils/env';

export const NetworkDebugScreen: React.FC = () => {
  const [results, setResults] = React.useState<string[]>([]);
  const [testing, setTesting] = React.useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test 1: 環境変数の確認
      addResult(`Supabase URL: ${SUPABASE_URL}`);
      
      // Test 2: 基本的なfetchテスト
      try {
        addResult('Testing basic fetch...');
        const response = await fetch('https://www.google.com');
        addResult(`Basic fetch success: ${response.status}`);
      } catch (error: any) {
        addResult(`Basic fetch failed: ${error.message}`);
      }
      
      // Test 3: Supabase接続テスト
      try {
        addResult('Testing Supabase connection...');
        const connected = await testSupabaseConnection();
        addResult(`Supabase connection: ${connected ? 'SUCCESS' : 'FAILED'}`);
      } catch (error: any) {
        addResult(`Supabase test error: ${error.message}`);
      }
      
      // Test 4: Supabase APIテスト
      try {
        addResult('Testing Supabase API...');
        const { data, error } = await supabase
          .from('external_products')
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`Supabase API error: ${error.message}`);
        } else {
          addResult('Supabase API: SUCCESS');
        }
      } catch (error: any) {
        addResult(`Supabase API exception: ${error.message}`);
      }
      
    } catch (error: any) {
      addResult(`Unexpected error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Debug</Text>
      
      <Button
        title={testing ? "Testing..." : "Run Network Tests"}
        onPress={runTests}
        disabled={testing}
      />
      
      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  results: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
