import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { testSupabaseConnection, supabase } from '../services/supabase';
import { SUPABASE_URL, RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID } from '../utils/env';
import { useStyle } from '@/contexts/ThemeContext';

export const NetworkDebugScreen: React.FC = () => {
  const { theme } = useStyle();
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
      addResult(`Rakuten App ID: ${RAKUTEN_APP_ID ? 'Set' : 'NOT SET'}`);
      addResult(`Rakuten Affiliate ID: ${RAKUTEN_AFFILIATE_ID ? 'Set' : 'NOT SET'}`);
      
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
      
      // Test 5: 楽天APIテスト
      if (RAKUTEN_APP_ID && RAKUTEN_AFFILIATE_ID) {
        try {
          addResult('Testing Rakuten API...');
          const params = new URLSearchParams({
            format: 'json',
            keyword: 'test',
            applicationId: RAKUTEN_APP_ID,
            affiliateId: RAKUTEN_AFFILIATE_ID,
            hits: '1',
          });
          
          const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?${params}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            addResult(`Rakuten API: SUCCESS (${data.Items ? data.Items.length : 0} items)`);
          } else {
            addResult(`Rakuten API: Failed with status ${response.status}`);
          }
        } catch (error: any) {
          addResult(`Rakuten API error: ${error.message}`);
        }
      } else {
        addResult('Rakuten API: Skipped (no API keys)');
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
    backgroundColor: theme.colors.surface,
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
