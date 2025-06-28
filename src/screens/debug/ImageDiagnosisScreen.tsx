import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image as RNImage,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { supabase } from '@/services/supabase';
import CachedImage from '@/components/common/CachedImage';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';

interface TestProduct {
  id: string;
  title: string;
  image_url: string;
  original_url?: string;
  optimized_url?: string;
}

const ImageDiagnosisScreen: React.FC = () => {
  const [products, setProducts] = useState<TestProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    loadTestProducts();
  }, []);

  const loadTestProducts = async () => {
    try {
      setLoading(true);
      
      // データベースから商品を取得
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, image_url')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .limit(5);

      if (error) {
        Alert.alert('エラー', 'データベースからの取得に失敗しました: ' + error.message);
        return;
      }

      if (data) {
        // 各商品に対して最適化URLも生成
        const productsWithOptimization = data.map(product => ({
          ...product,
          original_url: product.image_url,
          optimized_url: optimizeImageUrl(product.image_url)
        }));
        
        setProducts(productsWithOptimization);
        
        // 各URLのテストを実行
        productsWithOptimization.forEach(product => {
          testImageUrl(product.id, product.image_url);
          if (product.optimized_url !== product.image_url) {
            testImageUrl(product.id + '_optimized', product.optimized_url);
          }
        });
      }
    } catch (error) {
      console.error('画像診断エラー:', error);
      Alert.alert('エラー', '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const testImageUrl = async (id: string, url: string) => {
    const startTime = Date.now();
    
    try {
      // fetchで画像の存在を確認
      const response = await fetch(url, { method: 'HEAD' });
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [id]: {
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime: endTime - startTime,
          headers: {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            lastModified: response.headers.get('last-modified'),
            cacheControl: response.headers.get('cache-control'),
          },
          accessible: response.ok
        }
      }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [id]: {
          url,
          error: error.message,
          accessible: false
        }
      }));
    }
  };

  const renderImageTests = (product: TestProduct) => {
    const originalResult = testResults[product.id];
    const optimizedResult = testResults[product.id + '_optimized'];
    
    return (
      <View key={product.id} style={styles.productContainer}>
        <Text style={styles.productTitle}>{product.title}</Text>
        
        {/* オリジナルURL */}
        <View style={styles.urlSection}>
          <Text style={styles.urlLabel}>オリジナルURL:</Text>
          <Text style={styles.urlText} numberOfLines={3}>{product.original_url}</Text>
          {originalResult && (
            <View style={styles.testResult}>
              <Text style={[styles.status, { color: originalResult.accessible ? 'green' : 'red' }]}>
                ステータス: {originalResult.status || 'エラー'}
              </Text>
              <Text style={styles.detail}>応答時間: {originalResult.responseTime}ms</Text>
              <Text style={styles.detail}>
                Content-Type: {originalResult.headers?.contentType || 'N/A'}
              </Text>
            </View>
          )}
        </View>

        {/* 最適化されたURL（異なる場合のみ） */}
        {product.optimized_url !== product.original_url && (
          <View style={styles.urlSection}>
            <Text style={styles.urlLabel}>最適化URL:</Text>
            <Text style={styles.urlText} numberOfLines={3}>{product.optimized_url}</Text>
            {optimizedResult && (
              <View style={styles.testResult}>
                <Text style={[styles.status, { color: optimizedResult.accessible ? 'green' : 'red' }]}>
                  ステータス: {optimizedResult.status || 'エラー'}
                </Text>
                <Text style={styles.detail}>応答時間: {optimizedResult.responseTime}ms</Text>
                <Text style={styles.detail}>
                  Content-Type: {optimizedResult.headers?.contentType || 'N/A'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 画像表示テスト */}
        <View style={styles.imageTestContainer}>
          <View style={styles.imageTest}>
            <Text style={styles.imageTestLabel}>React Native Image:</Text>
            <RNImage 
              source={{ uri: product.optimized_url || product.image_url }}
              style={styles.testImage}
              onError={(e) => console.log('RN Image Error:', e.nativeEvent.error)}
            />
          </View>

          <View style={styles.imageTest}>
            <Text style={styles.imageTestLabel}>Expo Image:</Text>
            <ExpoImage
              source={{ uri: product.optimized_url || product.image_url }}
              style={styles.testImage}
              contentFit="cover"
              onError={(e) => console.log('Expo Image Error:', e)}
            />
          </View>

          <View style={styles.imageTest}>
            <Text style={styles.imageTestLabel}>CachedImage:</Text>
            <CachedImage
              source={{ uri: product.image_url }}
              style={styles.testImage}
              contentFit="cover"
              optimizeUrl={true}
              showErrorFallback={false}
            />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>画像診断を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>画像表示診断ツール</Text>
          <TouchableOpacity onPress={loadTestProducts} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>再読み込み</Text>
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <Text style={styles.noDataText}>商品データがありません</Text>
        ) : (
          products.map(renderImageTests)
        )}

        {/* デバッグ情報 */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>デバッグ情報:</Text>
          <Text style={styles.debugText}>テスト商品数: {products.length}</Text>
          <Text style={styles.debugText}>
            URL最適化が必要な商品: {
              products.filter(p => p.optimized_url !== p.original_url).length
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productContainer: {
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
    marginBottom: 12,
  },
  urlSection: {
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  urlText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  testResult: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: '#666',
  },
  imageTestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  imageTest: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  imageTestLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  testImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  debugInfo: {
    backgroundColor: '#f9f9f9',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default ImageDiagnosisScreen;
