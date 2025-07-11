import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Style'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2列グリッドのカード幅

// スタイルの選択肢
interface StyleOption {
  id: string;
  name: string;
  description: string;
  image: any; // 実際のプロジェクトではImageSourcePropType型を使用
}

const styleOptions: StyleOption[] = [
  {
    id: 'casual',
    name: 'カジュアル',
    description: '日常的でリラックスした着こなし',
    image: require('@/assets/style-casual.png'),
  },
  {
    id: 'street',
    name: 'ストリート',
    description: '個性的で都会的なスタイル',
    image: require('@/assets/style-street.png'),
  },
  {
    id: 'mode',
    name: 'モード',
    description: 'モノトーンを基調としたスタイリッシュな装い',
    image: require('@/assets/style-mode.png'),
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '自然体で優しい雰囲気のコーディネート',
    image: require('@/assets/style-natural.png'),
  },
  {
    id: 'classic',
    name: 'クラシック',
    description: '上品で落ち着いた大人のスタイル',
    image: require('@/assets/style-classic.png'),
  },
  {
    id: 'feminine',
    name: 'フェミニン',
    description: '女性らしさを強調した華やかな装い',
    image: require('@/assets/style-feminine.png'),
  },
];

const StyleScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { stylePreference, setStylePreference, nextStep, prevStep, getRecommendedStyles } = useOnboarding();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(stylePreference);
  const recommendedStyles = getRecommendedStyles();

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };

  const handleNext = () => {
    setStylePreference(selectedStyles);
    nextStep();
    navigation.navigate('StyleQuiz');
  };

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.stepIndicator, { color: theme.colors.text.secondary }]}>2/5</Text>
        </View>

        {/* タイトル */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>好きなスタイルを選んでください</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            複数選択可能です。あなたの好みに合わせたアイテムを提案します。
          </Text>
        </View>

        {/* スタイル選択 */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {styleOptions.map(style => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <TouchableOpacity
                  key={style.id}
                  style={styles.cardWrapper}
                  activeOpacity={0.7}
                  onPress={() => toggleStyle(style.id)}
                >
                  <View
                    style={[
                      styles.card,
                      { 
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: theme.colors.card.background 
                      },
                      isSelected && styles.cardSelected
                    ]}
                  >
                    <Image 
                      source={style.image} 
                      style={styles.image}
                      resizeMode="cover"
                    />
                    {recommendedStyles.includes(style.id) && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>おすすめ</Text>
                      </View>
                    )}
                    {isSelected && (
                      <View style={styles.checkmarkContainer}>
                        <View style={[styles.checkmarkBadge, { backgroundColor: theme.colors.primary }]}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <Text style={[
                        styles.styleName, 
                        { color: theme.colors.text.primary },
                        isSelected && [styles.styleNameSelected, { color: theme.colors.primary }]
                      ]}>
                        {style.name}
                      </Text>
                      <Text style={[styles.styleDescription, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                        {style.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
            disabled={selectedStyles.length === 0}
          >
            次へ
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    color: '#6B7280',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  image: {
    width: '100%',
    height: 120,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  checkmarkBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 4,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  styleNameSelected: {
    color: '#3B82F6',
  },
  styleDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});

export default StyleScreen;
