import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';

interface OnboardingHeaderProps {
  onBack?: () => void;
  onSkip?: () => void;
  currentStep: number;
  totalSteps: number;
  showSkip?: boolean;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  onBack,
  onSkip,
  currentStep,
  totalSteps,
  showSkip = false,
}) => {
  const { theme } = useStyle();
  
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      <Text style={[styles.stepText, { color: theme.colors.text.secondary }]}>
        {currentStep}/{totalSteps}
      </Text>
      
      {showSkip && onSkip ? (
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.text.secondary }]}>
            スキップ
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    marginLeft: -10,
  },
  skipButton: {
    padding: 10,
    marginRight: -10,
  },
  placeholder: {
    width: 44,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 16,
  },
});
