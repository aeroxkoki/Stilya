import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { fetchMixedProducts } from '@/services/productService';
import { FilterOptions } from '@/services/productService';

const FilterDebugScreen = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const runFilterTest = async (testName: string, filters: FilterOptions) => {
    setLoading(true);
    setCurrentTest(testName);
    
    try {
      const result = await fetchMixedProducts(null, 10, 0, filters);
      
      if (result.success && result.data) {
        const testResult = {
          testName,
          filters,
          productCount: result.data.length,
          categories: [...new Set(result.data.map(p => p.category))],
          priceRange: result.data.length > 0 ? {
            min: Math.min(...result.data.map(p => p.price)),
            max: Math.max(...result.data.map(p => p.price))
          } : null,
          usedCount: result.data.filter(p => p.isUsed).length,
          products: result.data.map(p => ({
            id: p.id,
            title: p.title.substring(0, 30) + '...',
            category: p.category,
            price: p.price,
            isUsed: p.isUsed
          }))
        };
        
        setResults(prev => [...prev, testResult]);
      } else {
        setResults(prev => [...prev, {
          testName,
          error: result.error || 'Failed to fetch products'
        }]);
      }
    } catch (error: any) {
      setResults(prev => [...prev, {
        testName,
        error: error.message || 'Unknown error'
      }]);
    }
    
    setLoading(false);
    setCurrentTest('');
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test 1: No filter
    await runFilterTest('フィルターなし', {});
    
    // Test 2: Category filter
    await runFilterTest('カテゴリー: tops', {
      categories: ['tops'],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: false
    });
    
    // Test 3: Price filter
    await runFilterTest('価格: 0-5000円', {
      categories: [],
      priceRange: [0, 5000],
      selectedTags: [],
      includeUsed: false
    });
    
    // Test 4: Used filter
    await runFilterTest('新品のみ', {
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: false
    });
    
    await runFilterTest('すべて（中古含む）', {
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: [],
      includeUsed: true
    });
    
    // Test 5: Complex filter
    await runFilterTest('複合フィルター', {
      categories: ['tops', 'bottoms'],
      priceRange: [3000, 10000],
      selectedTags: [],
      includeUsed: false
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>フィルター機能デバッグ</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runAllTests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? `テスト実行中: ${currentTest}` : 'フィルターテストを実行'}
        </Text>
      </TouchableOpacity>
      
      {loading && <ActivityIndicator style={styles.loader} />}
      
      {results.map((result, index) => (
        <View key={index} style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{result.testName}</Text>
          
          {result.error ? (
            <Text style={styles.error}>エラー: {result.error}</Text>
          ) : (
            <>
              <Text style={styles.resultText}>取得商品数: {result.productCount}</Text>
              <Text style={styles.resultText}>カテゴリー: {result.categories.join(', ')}</Text>
              {result.priceRange && (
                <Text style={styles.resultText}>
                  価格帯: ¥{result.priceRange.min} - ¥{result.priceRange.max}
                </Text>
              )}
              <Text style={styles.resultText}>中古品数: {result.usedCount}</Text>
              
              <View style={styles.productsList}>
                {result.products.slice(0, 3).map((product: any, idx: number) => (
                  <Text key={idx} style={styles.productItem}>
                    • {product.title} ({product.category}) ¥{product.price} {product.isUsed ? '[中古]' : ''}
                  </Text>
                ))}
                {result.productCount > 3 && (
                  <Text style={styles.productItem}>... 他 {result.productCount - 3} 件</Text>
                )}
              </View>
            </>
          )}
        </View>
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginBottom: 20,
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#475569',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
  },
  productsList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  productItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
});

export default FilterDebugScreen;
