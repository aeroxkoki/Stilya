import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image as RNImage,
} from 'react-native';
import { supabase } from '@/services/supabase';
import CachedImage from '@/components/common/CachedImage';
import { Image as ExpoImage } from 'expo-image';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';
import { diagnoseImageUrl, autoFixImageUrl } from '@/utils/imageValidation';

interface DiagnosisResult {
  productId: string;
  title: string;
  originalUrl: string;
  optimizedUrl: string;
  fixedUrl: string;
  diagnosis: {
    isValid: boolean;
    isSecure: boolean;
    domain: string;
    issues: string[];
    suggestions: string[];
  };
  tests: {
    rnImageWorks: boolean;
    expoImageWorks: boolean;
    cachedImageWorks: boolean;
    networkAccessible: boolean;
  };
}

const ImageDiagnosisScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [currentTest, setCurrentTest] = useState('');

  const testImageLoading = async (url: string): Promise<{
    rnImageWorks: boolean;
    expoImageWorks: boolean;
    cachedImageWorks: boolean;
    networkAccessible: boolean;
  }> => {
    const results = {
      rnImageWorks: false,
      expoImageWorks: false,
      cachedImageWorks: false,
      networkAccessible: false,
    };

    // ネットワークアクセステスト
    try {
      const response = await fetch(url, { method: 'HEAD' });
      results.networkAccessible = response.ok;
    } catch (error) {
      console.error('Network test failed:', error);
    }

    // React Native Imageテスト
    await new Promise<void>((resolve) => {
      RNImage.getSize(
        url,
        () => {
          results.rnImageWorks = true;
          resolve();
        },
        () => {
          results.rnImageWorks = false;
          resolve();
        }
      );
    });

    // Expo Imageテスト（prefetchを使用）
    try {
      await ExpoImage.prefetch(url);
      results.expoImageWorks = true;
    } catch (error) {
      results.expoImageWorks = false;
    }

    // CachedImageは他のテスト結果から推測
    results.cachedImageWorks = results.expoImageWorks;

    return results;
  };

  const runDiagnosis = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // データベースから商品を取得
      setCurrentTest('データベースから商品を取得中...');
      const { data: products, error } = await supabase
        .from('external_products')
        .select('id, title, image_url')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .limit(5);

      if (error) {
        Alert.alert('エラー', 'データベースからの取得に失敗しました');
        return;
      }

      if (!products || products.length === 0) {
        Alert.alert('情報', '診断する商品が見つかりません');
        return;
      }

      const diagnosisResults: DiagnosisResult[] = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setCurrentTest(`商品 ${i + 1}/${products.length} を診断中...`);

        // URL診断
        const diagnosis = diagnoseImageUrl(product.image_url);
        
        // URL最適化
        const optimizedUrl = optimizeImageUrl(product.image_url);
        
        // URL自動修正
        const { fixed: fixedUrl } = autoFixImageUrl(product.image_url);

        // 各種画像読み込みテスト（修正後のURLで実施）
        const testUrl = fixedUrl || optimizedUrl || product.image_url;
        const tests = await testImageLoading(testUrl);

        diagnosisResults.push({
          productId: product.id,
          title: product.title,
          originalUrl: product.image_url,
          optimizedUrl,
          fixedUrl,
          diagnosis,
          tests,
        });
      }

      setResults(diagnosisResults);
      setCurrentTest('');

      // 問題の要約
      const allWorking = diagnosisResults.every(r => 
        r.tests.expoImageWorks && r.tests.networkAccessible
      );

      if (!allWorking) {
        const httpCount = diagnosisResults.filter(r => !r.diagnosis.isSecure).length;
        const networkFailCount = diagnosisResults.filter(r => !r.tests.networkAccessible).length;
        
        Alert.alert(
          '診断結果',
          `問題が検出されました:\n` +
          `- HTTPの画像: ${httpCount}件\n` +
          `- ネットワークアクセス不可: ${networkFailCount}件\n\n` +
          `自動修正を実行しますか？`,
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '修正する', onPress: fixAllImages }
          ]
        );
      } else {
        Alert.alert('診断結果', 'すべての画像が正常に表示されています');
      }

    } catch (error) {
      console.error('Diagnosis error:', error);
      Alert.alert('エラー', '診断中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const fixAllImages = async () => {
    setIsLoading(true);
    setCurrentTest('画像URLを修正中...');

    try {
      // すべての商品の画像URLを修正
      const { data: products, error: fetchError } = await supabase
        .from('external_products')
        .select('id, image_url')
        .eq('is_active', true)
        .not('image_url', 'is', null);

      if (fetchError || !products) {
        throw new Error('商品の取得に失敗しました');
      }

      let fixedCount = 0;
      const batchSize = 50;

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const updates = batch.map(product => {
          const { fixed, wasFixed } = autoFixImageUrl(product.image_url);
          if (wasFixed) {
            fixedCount++;
            return {
              id: product.id,
              image_url: fixed
            };
          }
          return null;
        }).filter(Boolean);

        if (updates.length > 0) {
          const { error: updateError } = await supabase
            .from('external_products')
            .upsert(updates);

          if (updateError) {
            console.error('Update error:', updateError);
          }
        }

        setCurrentTest(`修正中... ${Math.min(i + batchSize, products.length)}/${products.length}`);
      }

      Alert.alert(
        '修正完了',
        `${fixedCount}件の画像URLを修正しました。\n\nアプリを再起動して確認してください。`
      );

      // 診断を再実行
      runDiagnosis();

    } catch (error) {
      console.error('Fix error:', error);
      Alert.alert('エラー', '修正中にエラーが発生しました');
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  const renderResult = (result: DiagnosisResult) => {
    const allTestsPassed = Object.values(result.tests).every(v => v);
    const bgColor = allTestsPassed ? '#d4edda' : '#f8d7da';

    return (
      <View key={result.productId} style={[styles.resultCard, { backgroundColor: bgColor }]}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {result.title}
        </Text>

        <View style={styles.urlSection}>
          <Text style={styles.label}>元のURL:</Text>
          <Text style={styles.url} numberOfLines={1}>
            {result.originalUrl}
          </Text>
        </View>

        {result.fixedUrl !== result.originalUrl && (
          <View style={styles.urlSection}>
            <Text style={styles.label}>修正後のURL:</Text>
            <Text style={[styles.url, styles.fixedUrl]} numberOfLines={1}>
              {result.fixedUrl}
            </Text>
          </View>
        )}

        <View style={styles.diagnosisSection}>
          <Text style={styles.label}>診断結果:</Text>
          {result.diagnosis.issues.length > 0 ? (
            result.diagnosis.issues.map((issue, index) => (
              <Text key={index} style={styles.issue}>• {issue}</Text>
            ))
          ) : (
            <Text style={styles.success}>問題なし</Text>
          )}
        </View>

        <View style={styles.testResults}>
          <Text style={styles.label}>画像読み込みテスト:</Text>
          <View style={styles.testGrid}>
            <TestResult label="ネットワーク" passed={result.tests.networkAccessible} />
            <TestResult label="RN Image" passed={result.tests.rnImageWorks} />
            <TestResult label="Expo Image" passed={result.tests.expoImageWorks} />
            <TestResult label="Cached Image" passed={result.tests.cachedImageWorks} />
          </View>
        </View>

        <View style={styles.imagePreview}>
          <Text style={styles.label}>画像プレビュー:</Text>
          <CachedImage
            source={{ uri: result.fixedUrl || result.originalUrl }}
            style={styles.previewImage}
            showLoadingIndicator
            showErrorFallback
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>画像表示診断ツール</Text>
        <Text style={styles.subtitle}>
          実機での画像表示問題を診断・修正します
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={runDiagnosis}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '診断中...' : '診断を開始'}
        </Text>
      </TouchableOpacity>

      {currentTest !== '' && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.statusText}>{currentTest}</Text>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>診断結果</Text>
          {results.map(renderResult)}
        </View>
      )}
    </ScrollView>
  );
};

const TestResult: React.FC<{ label: string; passed: boolean }> = ({ label, passed }) => (
  <View style={styles.testResult}>
    <Text style={[styles.testIcon, passed ? styles.testPass : styles.testFail]}>
      {passed ? '✓' : '✗'}
    </Text>
    <Text style={styles.testLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  statusText: {
    marginLeft: 10,
    color: '#666',
  },
  resultsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  urlSection: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  url: {
    fontSize: 12,
    color: '#333',
  },
  fixedUrl: {
    color: '#059669',
    fontWeight: 'bold',
  },
  diagnosisSection: {
    marginBottom: 10,
  },
  issue: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 10,
  },
  success: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 10,
  },
  testResults: {
    marginBottom: 10,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  testIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  testPass: {
    color: '#059669',
  },
  testFail: {
    color: '#dc2626',
  },
  testLabel: {
    fontSize: 12,
    color: '#333',
  },
  imagePreview: {
    marginTop: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 5,
  },
});

export default ImageDiagnosisScreen;
