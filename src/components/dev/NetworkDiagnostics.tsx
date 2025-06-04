import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase, testSupabaseConnection } from '../../services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/env';

export const NetworkDiagnostics: React.FC = () => {
  const [results, setResults] = React.useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const runTests = async () => {
    setResults([]);
    addResult('Starting network diagnostics...');

    // Test 1: Basic fetch to a known endpoint
    try {
      addResult('Test 1: Testing basic HTTPS fetch...');
      const response = await fetch('https://api.github.com');
      addResult(`Test 1 Success: GitHub API responded with status ${response.status}`);
    } catch (error) {
      addResult(`Test 1 Failed: ${error}`);
    }

    // Test 2: Fetch Supabase URL directly
    try {
      addResult('Test 2: Testing Supabase URL directly...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
        },
      });
      addResult(`Test 2 Success: Supabase responded with status ${response.status}`);
    } catch (error) {
      addResult(`Test 2 Failed: ${error}`);
    }

    // Test 3: Supabase client connection
    try {
      addResult('Test 3: Testing Supabase client...');
      const connected = await testSupabaseConnection();
      addResult(`Test 3 ${connected ? 'Success' : 'Failed'}: Supabase client connection`);
    } catch (error) {
      addResult(`Test 3 Failed: ${error}`);
    }

    // Test 4: Test auth endpoint specifically
    try {
      addResult('Test 4: Testing Supabase auth endpoint...');
      const { error } = await supabase.auth.getSession();
      if (error) {
        addResult(`Test 4 Failed: ${error.message}`);
      } else {
        addResult('Test 4 Success: Auth endpoint is accessible');
      }
    } catch (error) {
      addResult(`Test 4 Failed: ${error}`);
    }

    addResult('Diagnostics complete!');
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Diagnostics</Text>
      <TouchableOpacity style={styles.button} onPress={runTests}>
        <Text style={styles.buttonText}>Run Tests Again</Text>
      </TouchableOpacity>
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>
          {result}
        </Text>
      ))}
    </ScrollView>
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
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  result: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
