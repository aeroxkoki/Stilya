import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
// import { StyleQuizAnalyzer } from '@/services/recommendationService'; // TODO: 実装が必要
import { ProductCard } from '@/components/common';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'StyleReveal'>;

const { width } = Dimensions.get('window');

// スタイルタイプの定義
const styleTypes = {
  'casual': {
    name: 'カジュアル',
    emoji: '👕',
    description: 'リラックスして快適なスタイル',
    color: '#60A5FA'
  },
  'street': {
    name: 'ストリート',
    emoji: '🔥',
    description: '個性的で都会的なスタイル',
    color: '#F59E0B'
  },
  'mode': {
    name: 'モード',
    emoji: '🖤',
    description: 'モノトーンでスタイリッシュ',
    color: '#1F2937'
  },
  'natural': {
    name: 'ナチュラル',
    emoji: '🌿',
    description: '自然体で優しい雰囲気',
    color: '#84CC16'
  },
  'classic': {
    name: 'クラシック',
    emoji: '👔',
    description: '上品で落ち着いた大人のスタイル',
    color: '#6366F1'
  },
  'feminine': {
    name: 'フェミニン',
    emoji: '🌸',
    description: '女性らしく華やかな装い',
    color: '#EC4899'
  },
};

const StyleRevealScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { 
    styleQuizResults,
    getSelectionInsights,
    nextStep 
  } = useOnboarding();
  
  const { products } = useProducts();
  const [analysis, setAnalysis] = useState<any>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    analyzeResults();
  }, []);

  const analyzeResults = async () => {
    if (!styleQuizResults || styleQuizResults.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    // 診断結果を分析（簡易版）
    // TODO: StyleQuizAnalyzerの実装後に置き換える
    const quizAnalysis = {
      likedTags: styleQuizResults
        .filter(r => r.result === 'yes')
        .flatMap(r => r.tags || []),
      dislikedTags: styleQuizResults
        .filter(r => r.result === 'no')
        .flatMap(r => r.tags || []),
      preferredCategories: [],
      likePercentage: Math.round(
        (styleQuizResults.filter(r => r.result === 'yes').length / styleQuizResults.length) * 100
      )
    };
    const insights = getSelectionInsights();
    
    // 主要なスタイルタイプを判定
    const primaryStyle = determinePrimaryStyle(quizAnalysis.likedTags);
    
    setAnalysis({
      ...quizAnalysis,
      insights,
      primaryStyle
    });

    // おすすめ商品を選定（診断結果に基づく）
    if (products && products.length > 0) {
      const recommendations = selectRecommendations(products, quizAnalysis);
      setRecommendedProducts(recommendations);
    }

    setIsAnalyzing(false);
  };

  const determinePrimaryStyle = (likedTags: string[]): string => {
    const styleCounts: Record<string, number> = {};
    
    likedTags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      Object.keys(styleTypes).forEach(style => {
        if (lowerTag.includes(style)) {
          styleCounts[style] = (styleCounts[style] || 0) + 1;
        }
      });
    });

    // 最も多いスタイルを返す
    const sortedStyles = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a);
    
    return sortedStyles[0]?.[0] || 'casual';
  };

  const selectRecommendations = (allProducts: Product[], analysis: any): Product[] => {
    // 好みのタグを持つ商品を優先
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      
      if (product.tags) {
        product.tags.forEach(tag => {
          if (analysis.likedTags.includes(tag)) score += 2;
          if (analysis.dislikedTags.includes(tag)) score -= 1;
        });
      }
      
      if (product.category && analysis.preferredCategories.includes(product.category)) {
        score += 1;
      }
      
      return { ...product, score };
    });

    // スコアが高い商品を3つ選択
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleNext = () => {
    nextStep();
    navigation.navigate('Complete');
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          診断結果を分析中...
        </Text>
      </View>
    );
  }

  const primaryStyleInfo = styleTypes[analysis?.primaryStyle || 'casual'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={[styles.stepIndicator, { color: theme.colors.text.secondary }]}>
            3/3
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 結果表示 */}
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: theme.colors.text.primary }]}>
            診断結果
          </Text>
          
          {/* プライマリスタイル */}
          <View style={[styles.styleCard, { 
            backgroundColor: theme.colors.card.background,
            borderColor: primaryStyleInfo.color 
          }]}>
            <Text style={styles.styleEmoji}>{primaryStyleInfo.emoji}</Text>
            <Text style={[styles.styleName, { color: primaryStyleInfo.color }]}>
              {primaryStyleInfo.name}スタイル
            </Text>
            <Text style={[styles.styleDescription, { color: theme.colors.text.secondary }]}>
              {primaryStyleInfo.description}
            </Text>
          </View>

          {/* インサイト */}
          {analysis?.insights && (
            <View style={styles.insightsContainer}>
              <View style={styles.insightItem}>
                <Ionicons name="heart" size={24} color="#EF4444" />
                <Text style={[styles.insightText, { color: theme.colors.text.primary }]}>
                  Like率: {analysis.insights.likePercentage}%
                </Text>
              </View>
              
              {analysis.insights.dominantStyles.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={[styles.tagsLabel, { color: theme.colors.text.secondary }]}>
                    好みのキーワード:
                  </Text>
                  <View style={styles.tags}>
                    {analysis.insights.dominantStyles.slice(0, 3).map((tag: string, index: number) => (
                      <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* おすすめ商品プレビュー */}
          {recommendedProducts.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={[styles.recommendationsTitle, { color: theme.colors.text.primary }]}>
                あなたへのおすすめ
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.productScroll}
              >
                {recommendedProducts.map((product, index) => (
                  <View key={product.id} style={styles.productCardWrapper}>
                    <ProductCard 
                      product={product}
                      onPress={() => {}}
                      compact
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* メッセージ */}
          <View style={styles.messageContainer}>
            <Ionicons name="sparkles" size={32} color={theme.colors.primary} />
            <Text style={[styles.messageTitle, { color: theme.colors.text.primary }]}>
              準備完了！
            </Text>
            <Text style={[styles.messageText, { color: theme.colors.text.secondary }]}>
              あなたの好みを学習しました。
              これからパーソナライズされたアイテムをお届けします。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 次へボタン */}
      <View style={[styles.buttonContainer, { 
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border 
      }]}>
        <Button
          isFullWidth
          onPress={handleNext}
        >
          始める
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  styleCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  styleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  styleName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  styleDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insightText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  productScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productCardWrapper: {
    width: width * 0.4,
    marginRight: 12,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 24,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
});

export default StyleRevealScreen;
