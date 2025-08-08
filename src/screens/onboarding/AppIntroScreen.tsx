import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import { TutorialSwipeContainer } from '@/components/onboarding';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AppIntro'>;

const AppIntroScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    // 完了後、1秒待ってから次へ進む
    setTimeout(() => {
      navigation.navigate('Gender');
    }, 1000);
  };

  const handleSkip = () => {
    // スキップして性別選択画面へ
    navigation.navigate('Gender');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.colors.text.secondary }]}>スキップ</Text>
        </TouchableOpacity>
      </View>

      {/* チュートリアルスワイプコンテナ */}
      <TutorialSwipeContainer onComplete={handleTutorialComplete} />

      {/* 完了メッセージ */}
      {tutorialCompleted && (
        <View style={styles.completedOverlay}>
          <View style={[styles.completedCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="checkmark-circle" size={60} color={theme.colors.primary} />
            <Text style={[styles.completedTitle, { color: theme.colors.text.primary }]}>
              準備完了！
            </Text>
            <Text style={[styles.completedText, { color: theme.colors.text.secondary }]}>
              次はあなたについて教えてください
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  skipText: {
    fontSize: 16,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  completedCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 32,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AppIntroScreen;
