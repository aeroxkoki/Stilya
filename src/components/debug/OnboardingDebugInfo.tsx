import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useProducts } from '@/hooks/useProducts';
import { useStyle } from '@/contexts/ThemeContext';

export const OnboardingDebugInfo: React.FC = () => {
  const { theme } = useStyle();
  const { gender, ageGroup, stylePreference } = useOnboarding();
  const { products, totalFetched } = useProducts();
  
  // 性別タグの検証
  const genderTags = {
    male: ['メンズ', 'メンズファッション', 'mens', 'men', '男性', 'ユニセックス'],
    female: ['レディース', 'レディースファッション', 'ladies', 'women', '女性', 'ユニセックス'],
    other: ['ユニセックス', 'unisex', '男女兼用']
  };
  
  // 年代別価格帯
  const priceRanges = {
    teens: { min: 1000, max: 5000 },
    twenties: { min: 2000, max: 10000 },
    thirties: { min: 3000, max: 20000 },
    forties: { min: 5000, max: 30000 },
    fifties_plus: { min: 5000, max: 50000 }
  };
  
  const currentGenderTags = gender ? genderTags[gender] : [];
  const currentPriceRange = ageGroup ? priceRanges[ageGroup as keyof typeof priceRanges] : null;
  
  // 統計を計算
  const stats = products.reduce((acc, product) => {
    // 性別マッチ
    if (product.tags && currentGenderTags.length > 0) {
      const hasGenderTag = product.tags.some(tag => 
        currentGenderTags.some(gt => 
          tag.toLowerCase().includes(gt.toLowerCase()) ||
          gt.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (hasGenderTag) acc.genderMatched++;
    }
    
    // 価格帯マッチ
    if (currentPriceRange && product.price >= currentPriceRange.min && product.price <= currentPriceRange.max) {
      acc.priceMatched++;
    }
    
    // スタイルマッチ
    if (product.tags && stylePreference.length > 0) {
      const hasStyleTag = product.tags.some(tag => 
        stylePreference.some(style => 
          tag.toLowerCase().includes(style.toLowerCase()) ||
          style.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (hasStyleTag) acc.styleMatched++;
    }
    
    return acc;
  }, { genderMatched: 0, priceMatched: 0, styleMatched: 0 });
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          オンボーディング情報の反映状況
        </Text>
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            ユーザー設定
          </Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            性別: {gender || '未設定'}
          </Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            年代: {ageGroup || '未設定'}
          </Text>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            スタイル: {stylePreference.join(', ') || '未設定'}
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            商品マッチング統計
          </Text>
          <Text style={[styles.stat, { color: theme.colors.text.primary }]}>
            総商品数: {products.length}
          </Text>
          <Text style={[styles.stat, { color: theme.colors.success }]}>
            性別マッチ: {stats.genderMatched} ({Math.round(stats.genderMatched / products.length * 100)}%)
          </Text>
          <Text style={[styles.stat, { color: theme.colors.success }]}>
            価格帯マッチ: {stats.priceMatched} ({Math.round(stats.priceMatched / products.length * 100)}%)
          </Text>
          <Text style={[styles.stat, { color: theme.colors.success }]}>
            スタイルマッチ: {stats.styleMatched} ({Math.round(stats.styleMatched / products.length * 100)}%)
          </Text>
        </View>
        
        {currentPriceRange && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              適用された価格帯
            </Text>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              ¥{currentPriceRange.min.toLocaleString()} 〜 ¥{currentPriceRange.max.toLocaleString()}
            </Text>
          </View>
        )}
        
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            初期商品の例（最初の5件）
          </Text>
          {products.slice(0, 5).map((product, index) => (
            <View key={product.id} style={styles.productItem}>
              <Text style={[styles.productTitle, { color: theme.colors.text.primary }]}>
                {index + 1}. {product.title}
              </Text>
              <Text style={[styles.productDetail, { color: theme.colors.text.secondary }]}>
                価格: ¥{product.price.toLocaleString()}
              </Text>
              <Text style={[styles.productDetail, { color: theme.colors.text.secondary }]}>
                タグ: {product.tags?.join(', ') || 'なし'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  stat: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  productItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
});
