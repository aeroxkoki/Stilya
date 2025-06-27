import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/services/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';

export function ImageDebugScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, image_url, source')
        .eq('is_active', true)
        .limit(5);

      if (error) {
        Alert.alert('エラー', error.message);
        return;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      };
    } catch (err) {
      return { status: 0, ok: false, error: err.message };
    }
  };

  const renderProduct = (product: any) => {
    const originalUrl = product.image_url || '';
    const optimizedUrl = optimizeImageUrl(originalUrl);
    const hasChanged = originalUrl !== optimizedUrl;

    return (
      <View key={product.id} style={styles.productCard}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productId}>ID: {product.id}</Text>
        <Text style={styles.productSource}>Source: {product.source}</Text>
        
        <View style={styles.urlSection}>
          <Text style={styles.urlLabel}>元のURL:</Text>
          <Text style={styles.urlText} numberOfLines={3}>{originalUrl || 'なし'}</Text>
          {originalUrl.includes('thumbnail.image.rakuten.co.jp') && (
            <Text style={styles.warning}>⚠️ 楽天サムネイルURL</Text>
          )}
        </View>

        {hasChanged && (
          <View style={styles.urlSection}>
            <Text style={styles.urlLabel}>最適化後:</Text>
            <Text style={styles.urlText} numberOfLines={3}>{optimizedUrl}</Text>
            <Text style={styles.success}>✅ 最適化済み</Text>
          </View>
        )}

        <View style={styles.imageContainer}>
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>元の画像</Text>
            <Image
              source={{ uri: originalUrl }}
              style={styles.image}
              contentFit="cover"
              onError={(e) => console.log('Original image error:', e)}
            />
          </View>
          
          {hasChanged && (
            <View style={styles.imageBox}>
              <Text style={styles.imageLabel}>最適化後</Text>
              <Image
                source={{ uri: optimizedUrl }}
                style={styles.image}
                contentFit="cover"
                onError={(e) => console.log('Optimized image error:', e)}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            const originalTest = await testImageUrl(originalUrl);
            const optimizedTest = hasChanged ? await testImageUrl(optimizedUrl) : null;
            
            let message = `元のURL:\nStatus: ${originalTest.status}\n`;
            message += originalTest.ok ? '✅ 取得成功' : '❌ 取得失敗';
            
            if (optimizedTest) {
              message += `\n\n最適化後:\nStatus: ${optimizedTest.status}\n`;
              message += optimizedTest.ok ? '✅ 取得成功' : '❌ 取得失敗';
            }
            
            Alert.alert('画像URL テスト結果', message);
          }}
        >
          <Text style={styles.testButtonText}>URLをテスト</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>画像デバッグ</Text>
        <TouchableOpacity onPress={loadProducts}>
          <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <Text style={styles.loading}>読み込み中...</Text>
        ) : products.length === 0 ? (
          <Text style={styles.empty}>商品がありません</Text>
        ) : (
          products.map(renderProduct)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productSource: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  urlSection: {
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  warning: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  success: {
    color: '#4ecdc4',
    fontSize: 12,
    marginTop: 4,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  imageBox: {
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 12,
    marginBottom: 8,
    color: '#666',
  },
  image: {
    width: 120,
    height: 160,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  testButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
