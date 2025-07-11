import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useStyle } from '@/contexts/ThemeContext';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  showStepLabels?: boolean;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  showStepLabels = false,
}) => {
  const { theme } = useStyle();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (currentStep / totalSteps) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const stepLabels = ['性別', 'スタイル', '診断', '年代', '完了'];

  return (
    <View style={styles.container}>
      {/* プログレスバー */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.primary,
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* ステップインジケーター */}
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <View key={index} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isActive || isCompleted
                      ? theme.colors.primary
                      : theme.colors.border,
                    borderColor: isActive
                      ? theme.colors.primary
                      : 'transparent',
                  },
                  isActive && styles.activeStepDot,
                ]}
              >
                {isCompleted && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                {isActive && (
                  <View style={[styles.innerDot, { backgroundColor: theme.colors.background }]} />
                )}
              </View>
              {showStepLabels && stepLabels[index] && (
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive || isCompleted
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    },
                  ]}
                >
                  {stepLabels[index]}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ステップ表示 */}
      <Text style={[styles.stepText, { color: theme.colors.text.secondary }]}>
        ステップ {currentStep} / {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStepDot: {
    transform: [{ scale: 1.2 }],
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  stepText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default OnboardingProgress;