import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/services/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './src/utils/env';

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('確認中...');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase接続テスト
    const testConnection = async () => {
      try {
        setLoading(true);
        
        // 環境変数の確認
        console.log('SUPABASE_URL:', SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY.substring(0, 10) + '...');
        
        // Supabaseに接続して、health checkを行う
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);
        
        if (error) throw error;
        
        setConnectionStatus('接続成功!');
        setProducts(data || []);
      } catch (err: any) {
        console.error('接続エラー:', err);
        setConnectionStatus('接続失敗');
        setError(err.message || '不明なエラー');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Stilya接続テスト</Text>
        <Text style={[
          styles.status, 
          connectionStatus === '接続成功!' ? styles.success : 
          connectionStatus === '接続失敗' ? styles.error : 
          styles.loading
        ]}>
          {connectionStatus}
        </Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>エラー:</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loading}>読み込み中...</Text>
        ) : products.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>取得した商品データ ({products.length}件):</Text>
            {products.map((product, index) => (
              <View key={product.id} style={styles.productCard}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productPrice}>¥{product.price.toLocaleString()}</Text>
                <Text style={styles.productTags}>
                  {product.tags ? product.tags.join(', ') : 'タグなし'}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noData}>商品データがありません</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  success: {
    color: '#22c55e',
  },
  error: {
    color: '#ef4444',
  },
  loading: {
    color: '#3b82f6',
  },
  errorContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#b91c1c',
    marginBottom: 5,
  },
  errorMessage: {
    color: '#b91c1c',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  productCard: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 5,
  },
  productTags: {
    fontSize: 13,
    color: '#6b7280',
  },
  noData: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
