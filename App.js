import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';

// シンプルなテスト用アプリコンポーネント
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stilya</Text>
        <Text style={styles.subtitle}>ファッション好みを学習するアプリ</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardText}>シンプルモードで起動中</Text>
          <Text style={styles.description}>
            この画面はTypeScript処理の問題を回避するために表示されています。
          </Text>
        </View>
        
        <Button 
          title="タップしてみよう" 
          onPress={() => alert('Stilyaへようこそ！')} 
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3B82F6',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
