import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { SelectionButton, OnboardingProgress } from '@/components/onboarding';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Gender'>;

const { height } = Dimensions.get('window');

const GenderScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { gender, setGender, nextStep, prevStep } = useOnboarding();
  
  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 画面表示時のアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    nextStep();
    navigation.navigate('Style');
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
        </View>

        {/* プログレスバー */}
        <OnboardingProgress currentStep={1} totalSteps={5} showStepLabels={false} />

        {/* メインコンテンツ */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* タイトル */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              あなたの性別を教えてください
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              より適切なスタイル提案のために使用されます
            </Text>
          </View>

          {/* 選択肢 */}
          <View style={styles.optionsContainer}>
            <SelectionButton
              title="男性"
              subtitle="メンズスタイル"
              icon={<Ionicons name="male" size={28} color={gender === 'male' ? theme.colors.primary : theme.colors.text.secondary} />}
              isSelected={gender === 'male'}
              onPress={() => setGender('male')}
            />

            <SelectionButton
              title="女性"
              subtitle="レディーススタイル"
              icon={<Ionicons name="female" size={28} color={gender === 'female' ? theme.colors.primary : theme.colors.text.secondary} />}
              isSelected={gender === 'female'}
              onPress={() => setGender('female')}
            />

            <SelectionButton
              title="その他"
              subtitle="ユニセックススタイル"
              icon={<Ionicons name="person" size={28} color={gender === 'other' ? theme.colors.primary : theme.colors.text.secondary} />}
              isSelected={gender === 'other'}
              onPress={() => setGender('other')}
            />
          </View>
        </Animated.View>

        {/* 次へボタン */}
        <View style={styles.buttonContainer}>
          <Button
            isFullWidth
            onPress={handleNext}
            disabled={!gender}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleContainer: {
    marginTop: height * 0.03,
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
  optionsContainer: {
    gap: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});

export default GenderScreen;