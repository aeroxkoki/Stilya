import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
import { StylePlaceholder } from '@/components/common/ImagePlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'QuickProfile'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// 性別の選択肢
const genderOptions = [
  { id: 'male', label: '男性', icon: 'male' },
  { id: 'female', label: '女性', icon: 'female' },
  { id: 'other', label: 'その他', icon: 'person' },
] as const;

// 年齢層の選択肢
const ageGroups = [
  { id: '10-19', label: '10代' },
  { id: '20-29', label: '20代' },
  { id: '30-39', label: '30代' },
  { id: '40-49', label: '40代' },
  { id: '50+', label: '50代以上' },
];

// スタイルの選択肢（2つまで選択）
const styleOptions = [
  { id: 'casual', name: 'カジュアル', description: '日常的でリラックス' },
  { id: 'street', name: 'ストリート', description: '個性的で都会的' },
  { id: 'mode', name: 'モード', description: 'モノトーンでスタイリッシュ' },
  { id: 'natural', name: 'ナチュラル', description: '自然体で優しい' },
  { id: 'classic', name: 'クラシック', description: '上品で落ち着いた' },
  { id: 'feminine', name: 'フェミニン', description: '女性らしく華やか' },
];

const QuickProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { 
    setGender, 
    setStylePreference, 
    setAgeGroup,
    nextStep 
  } = useOnboarding();
  
  // 性別選択は一時的に無効化（後で復活できるようにコメントアウト）
  // const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        // 最大2つまで選択可能
        if (prev.length >= 2) {
          // 最初の要素を削除して新しいものを追加
          return [...prev.slice(1), styleId];
        }
        return [...prev, styleId];
      }
    });
  };

  // 性別選択を必須から除外
  const canProceed = selectedAge && selectedStyles.length >= 1;

  const handleNext = () => {
    if (!canProceed) return;
    
    // デフォルトで女性を設定（現在は女性用商品のみのため）
    setGender('female');
    setAgeGroup(selectedAge!);
    setStylePreference(selectedStyles);
    nextStep();
    navigation.navigate('UnifiedSwipe');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.stepIndicator, { color: theme.colors.text.secondary }]}>
            1/3
          </Text>
        </View>

        {/* タイトル */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            あなたについて教えてください
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            最適なアイテムをおすすめするために、簡単な質問にお答えください
          </Text>
        </View>

        {/* 性別選択 - 一時的に非表示（後で復活できるようにコメントアウト） */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            性別
          </Text>
          <View style={styles.genderContainer}>
            {genderOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.genderCard,
                  { 
                    borderColor: selectedGender === option.id 
                      ? theme.colors.primary 
                      : theme.colors.border,
                    backgroundColor: selectedGender === option.id
                      ? theme.colors.primary + '10'
                      : theme.colors.card.background
                  },
                  selectedGender === option.id && styles.selectedCard
                ]}
                onPress={() => setSelectedGender(option.id)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={selectedGender === option.id 
                    ? theme.colors.primary 
                    : theme.colors.text.secondary} 
                />
                <Text style={[
                  styles.genderLabel,
                  { 
                    color: selectedGender === option.id 
                      ? theme.colors.primary 
                      : theme.colors.text.primary 
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        {/* 年齢層選択 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            年齢層
          </Text>
          <View style={styles.ageContainer}>
            {ageGroups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.ageButton,
                  { 
                    borderColor: selectedAge === group.id 
                      ? theme.colors.primary 
                      : theme.colors.border,
                    backgroundColor: selectedAge === group.id
                      ? theme.colors.primary
                      : theme.colors.card.background
                  }
                ]}
                onPress={() => setSelectedAge(group.id)}
              >
                <Text style={[
                  styles.ageLabel,
                  { 
                    color: selectedAge === group.id 
                      ? '#FFFFFF' 
                      : theme.colors.text.primary 
                  }
                ]}>
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* スタイル選択 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            好きなスタイル（2つまで選択）
          </Text>
          <View style={styles.styleGrid}>
            {styleOptions.map(style => {
              const isSelected = selectedStyles.includes(style.id);
              return (
                <TouchableOpacity
                  key={style.id}
                  style={styles.styleCardWrapper}
                  onPress={() => toggleStyle(style.id)}
                >
                  <View
                    style={[
                      styles.styleCard,
                      { 
                        borderColor: isSelected 
                          ? theme.colors.primary 
                          : theme.colors.border,
                        backgroundColor: theme.colors.card.background
                      },
                      isSelected && styles.selectedStyleCard
                    ]}
                  >
                    <StylePlaceholder 
                      styleName={style.id} 
                      width={CARD_WIDTH - 2}
                      height={100}
                    />
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <View style={[styles.checkmarkBadge, { backgroundColor: theme.colors.primary }]}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      </View>
                    )}
                    <View style={styles.styleInfo}>
                      <Text style={[
                        styles.styleName,
                        { color: isSelected ? theme.colors.primary : theme.colors.text.primary }
                      ]}>
                        {style.name}
                      </Text>
                      <Text style={[styles.styleDesc, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                        {style.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
          disabled={!canProceed}
        >
          次へ
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedCard: {
    borderWidth: 2,
  },
  genderLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  ageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  ageLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  styleCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  selectedStyleCard: {
    borderWidth: 2,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  checkmarkBadge: {
    borderRadius: 12,
    padding: 4,
  },
  styleInfo: {
    padding: 10,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  styleDesc: {
    fontSize: 11,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
});

export default QuickProfileScreen;
