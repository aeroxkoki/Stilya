import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { SelectionButton } from '@/components/onboarding';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AgeGroup'>;

const { height } = Dimensions.get('window');

// 年代の選択肢（DBスキーマに合わせて修正）
const ageGroups = [
  { id: 'teens', label: '10代', subtitle: 'トレンドを追求する世代' },
  { id: 'twenties', label: '20代', subtitle: '個性を表現する世代' },
  { id: 'thirties', label: '30代', subtitle: '大人の洗練を求める世代' },
  { id: 'forties', label: '40代', subtitle: '上質なスタイルを選ぶ世代' },
  { id: 'fifties_plus', label: '50代以上', subtitle: 'エレガントな装いを好む世代' },
];

const AgeGroupScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { ageGroup, setAgeGroup, nextStep, prevStep } = useOnboarding();

  const handleNext = () => {
    nextStep();
    navigation.navigate('Complete');
  };

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  const handleSkip = () => {
    // 年代をスキップして完了画面へ
    navigation.navigate('Complete');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Text style={[styles.stepIndicator, { color: theme.colors.text.secondary }]}>4/5</Text>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: theme.colors.text.secondary }]}>スキップ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          {/* タイトル */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              あなたの年代を教えてください
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              年代に合わせたスタイル提案のために使用されます（任意）
            </Text>
          </View>

          {/* 年代選択 */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {ageGroups.map(age => {
                const getIcon = () => {
                  switch(age.id) {
                    case 'teens': return '🎮';
                    case 'twenties': return '🎨';
                    case 'thirties': return '💼';
                    case 'forties': return '🌟';
                    case 'fifties_plus': return '👑';
                    default: return '👤';
                  }
                };
                
                return (
                  <SelectionButton
                    key={age.id}
                    title={age.label}
                    subtitle={age.subtitle}
                    icon={<Text style={styles.emojiIcon}>{getIcon()}</Text>}
                    isSelected={ageGroup === age.id}
                    onPress={() => setAgeGroup(age.id)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 次へボタン */}
        <View style={styles.buttonContainer}>
          <Button
            isFullWidth
            onPress={handleNext}
            disabled={!ageGroup}
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
    paddingTop: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleContainer: {
    marginTop: height * 0.05,
    marginBottom: height * 0.04,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  emojiIcon: {
    fontSize: 28,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});

export default AgeGroupScreen;