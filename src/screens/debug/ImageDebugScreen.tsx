import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { supabase } from '@/services/supabase';
import CachedImage from '@/components/common/CachedImage';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';

interface ImageTestResult {
  id: string;
  title: string;
  originalUrl: string;
  optimizedUrl: string;
  isRakuten: boolean;
  isThumbnail: boolean;
  imageLoaded: boolean;
}

export default function ImageDebugScreen() {
  const [results, setResults] = useState<ImageTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withImage: 0,
    withoutImage: 0,
    thumbnailCount: 0,
    optimizedCount: 0,
  });

  const testImageUrls = async () => {
    setLoading(true);
    try {
      // Supabaseから商品データを取得
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, title, image_url')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .not('image_url', 'eq', '')
        .limit(20);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (!products || products.length === 0) {
        console.log('No products found');
        return;
      }

      // 各商品の画像URLをテスト
      const testResults: ImageTestResult[] = products.map(product => {
        const originalUrl = product.image_url || '';
        const optimizedUrl = optimizeImageUrl(originalUrl);
        const isRakuten = originalUrl.includes('rakuten');
        const isThumbnail = originalUrl.includes('thumbnail') || 
                          originalUrl.includes('128x128') || 
                          originalUrl.includes('64x64');

        return {
          id: product.id,
          title: product.title,
          originalUrl,
          optimizedUrl,
          isRakuten,
          isThumbnail,
          imageLoaded: false,
        };
      });

      // 統計情報を計算
      const newStats = {
        total: testResults.length,
        withImage: testResults.filter(r => r.originalUrl).length,
        withoutImage: testResults.filter(r => !r.originalUrl).length,
        thumbnailCount: testResults.filter(r => r.isThumbnail).length,
        optimizedCount: testResults.filter(r => r.originalUrl !== r.optimizedUrl).length,
      };

      setResults(testResults);
      setStats(newStats);
    } catch (error) {
      console.error('Error in testImageUrls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testImageUrls();
  }, []);

  const handleImageLoad = (index: number) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[index].imageLoaded = true;
      return newResults;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>画像URLをテスト中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>画像URLデバッグ</Text>
        <Button title="再テスト" onPress={testImageUrls} />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>統計情報</Text>
        <Text style={styles.statsText}>総商品数: {stats.total}</Text>
        <Text style={styles.statsText}>画像URLあり: {stats.withImage}</Text>
        <Text style={styles.statsText}>画像URLなし: {stats.withoutImage}</Text>
        <Text style={styles.statsText}>サムネイルURL: {stats.thumbnailCount}</Text>
        <Text style={styles.statsText}>最適化されたURL: {stats.optimizedCount}</Text>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>テスト結果</Text>
        {results.map((result, index) => (
          <View key={result.id} style={styles.resultItem}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {index + 1}. {result.title}
            </Text>
            
            <View style={styles.urlContainer}>
              <Text style={styles.urlLabel}>元URL:</Text>
              <Text style={styles.urlText} numberOfLines={2}>
                {result.originalUrl || 'なし'}
              </Text>
            </View>

            {result.originalUrl !== result.optimizedUrl && (
              <View style={styles.urlContainer}>
                <Text style={styles.urlLabel}>最適化URL:</Text>
                <Text style={[styles.urlText, styles.optimizedUrl]} numberOfLines={2}>
                  {result.optimizedUrl}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              {result.isRakuten && (
                <Text style={styles.badge}>楽天</Text>
              )}
              {result.isThumbnail && (
                <Text style={[styles.badge, styles.warningBadge]}>サムネイル</Text>
              )}
              {result.imageLoaded && (
                <Text style={[styles.badge, styles.successBadge]}>読込成功</Text>
              )}
            </View>

            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Text style={styles.imageLabel}>元画像:</Text>
                <CachedImage
                  source={{ uri: result.originalUrl }}
                  style={styles.testImage}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => console.log(`Failed to load original: ${result.originalUrl}`)}
                  highQuality={false}
                />
              </View>

              {result.originalUrl !== result.optimizedUrl && (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>最適化画像:</Text>
                  <CachedImage
                    source={{ uri: result.optimizedUrl }}
                    style={styles.testImage}
                    onError={() => console.log(`Failed to load optimized: ${result.optimizedUrl}`)}
                    highQuality={true}
                  />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  resultsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
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
  urlContainer: {
    marginBottom: 8,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 12,
    color: '#333',
  },
  optimizedUrl: {
    color: '#007AFF',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 8,
  },
  warningBadge: {
    backgroundColor: '#FFE4B5',
    color: '#FF8C00',
  },
  successBadge: {
    backgroundColor: '#90EE90',
    color: '#228B22',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageWrapper: {
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  testImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});
