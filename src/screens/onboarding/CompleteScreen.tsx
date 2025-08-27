import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Animated,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList, fashionStyleToTheme, FashionStyle, StyleType } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
import { STYLE_ID_TO_JP_TAG } from '@/constants/constants';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Complete'>;

const { width, height } = Dimensions.get('window');

const CompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, setStyleType } = useStyle();
  const { gender, stylePreference, ageGroup, styleQuizResults, getSelectionInsights, saveUserProfile, completeOnboarding, isLoading, error } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAutoNavigating, setIsAutoNavigating] = useState(false);
  
  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<NodeJS.Timeout>();

  // スタイル選択に基づいてテーマを決定
  useEffect(() => {
    if (stylePreference.length > 0) {
      // 選択されたファッションスタイルからテーマを決定
      const themeCounts: Record<StyleType, number> = {
        minimal: 0,
        natural: 0,
        bold: 0,
      };

      // 選択された各スタイルに対応するテーマをカウント
      stylePreference.forEach(style => {
        const themeType = fashionStyleToTheme[style as FashionStyle];
        if (themeType) {
          themeCounts[themeType]++;
        }
      });

      // 最も多く選ばれたテーマを適用
      let selectedTheme: StyleType = 'minimal';
      let maxCount = 0;
      Object.entries(themeCounts).forEach(([theme, count]) => {
        if (count > maxCount) {
          maxCount = count;
          selectedTheme = theme as StyleType;
        }
      });

      // テーマを設定
      setStyleType(selectedTheme);
    }
  }, [stylePreference, setStyleType]);

  // 初回表示時のアニメーション
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 年代のマッピング（DBスキーマに合わせて修正）
  const ageGroupMap: Record<string, string> = {
    teens: '10代',
    twenties: '20代',
    thirties: '30代',
    forties: '40代',
    fifties_plus: '50代以上',
  };

  // 性別のマッピング
  const genderMap: Record<string, string> = {
    male: '男性',
    female: '女性',
    other: 'その他',
  };

  // 成功モーダルのアニメーション
  const showSuccessAnimation = () => {
    setShowSuccessModal(true);
    
    // 振動フィードバック
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // チェックマークアニメーション
    Animated.sequence([
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkAnim, {
        toValue: 1.2,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // プログレスバーアニメーション
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // カウントダウン開始
    setIsAutoNavigating(true);
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return prev;
        }
        return prev - 1;
      });
    }, 1000);

    // 3秒後に自動遷移
    setTimeout(() => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      handleAutoNavigate();
    }, 3000);
  };

  const handleAutoNavigate = async () => {
    try {
      await completeOnboarding();
      // AppNavigatorが自動的にMain画面に遷移する
    } catch (error) {
      console.error('Auto navigation error:', error);
      setShowSuccessModal(false);
      setIsAutoNavigating(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveUserProfile();
      // 成功アニメーションを表示
      showSuccessAnimation();
    } catch (error) {
      Alert.alert(
        'エラー',
        'プロフィールの保存中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipWait = async () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setShowSuccessModal(false);
    await handleAutoNavigate();
  };

  // 選択したスタイルの名前を取得
  const getStyleNames = () => {
    return stylePreference.map((style: any) => STYLE_ID_TO_JP_TAG[style] || style).join('、');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* タイトル */}
        <View style={styles.titleContainer}>
          <Animated.View 
            style={[
              styles.iconContainer, 
              { 
                backgroundColor: theme.colors.surface,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Ionicons name="checkmark" size={48} color={theme.colors.success} />
          </Animated.View>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            プロフィール設定完了！
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            あなたの好みに合わせた商品をご提案します
          </Text>
        </View>

        {/* プロフィール概要 */}
        <View style={[styles.profileSummary, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>プロフィール概要</Text>
          
          <View style={[styles.profileItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.profileLabel, { color: theme.colors.text.secondary }]}>性別</Text>
            <Text style={[styles.profileValue, { color: theme.colors.text.primary }]}>
              {gender ? genderMap[gender] || gender : '未設定'}
            </Text>
          </View>
          
          <View style={[styles.profileItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.profileLabel, { color: theme.colors.text.secondary }]}>好きなスタイル</Text>
            <Text style={[styles.profileValue, { color: theme.colors.text.primary }]}>
              {stylePreference.length > 0 ? getStyleNames() : '未設定'}
            </Text>
          </View>
          
          <View style={[styles.profileItem, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.profileLabel, { color: theme.colors.text.secondary }]}>年代</Text>
            <Text style={[styles.profileValue, { color: theme.colors.text.primary }]}>
              {ageGroup ? ageGroupMap[ageGroup] || ageGroup : '未設定'}
            </Text>
          </View>
        </View>

        {/* スタイル診断結果 */}
        {styleQuizResults && styleQuizResults.length > 0 && (
          <View style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              スタイル診断結果
            </Text>
            
            {(() => {
              const insights = getSelectionInsights();
              return (
                <>
                  <View style={styles.insightItem}>
                    <Text style={[styles.insightLabel, { color: theme.colors.text.secondary }]}>
                      好みの一致度
                    </Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              backgroundColor: theme.colors.primary,
                              width: `${insights.likePercentage}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.percentageText, { color: theme.colors.text.primary }]}>
                        {insights.likePercentage}%
                      </Text>
                    </View>
                  </View>
                  
                  {insights.consistentWithPreference && (
                    <View style={styles.consistencyBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      <Text style={[styles.consistencyText, { color: theme.colors.success }]}>
                        選択したスタイルと一致しています
                      </Text>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        )}

        {/* エラーメッセージ */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        {/* 完了ボタン */}
        <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background }]}>
          <Button
            isFullWidth
            onPress={handleComplete}
            isLoading={isLoading || isSaving}
          >
            始める
          </Button>
        </View>
      </Animated.View>

      {/* 成功モーダル */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Animated.View
              style={[
                styles.successIconContainer,
                {
                  transform: [{ scale: checkmarkAnim }],
                  opacity: checkmarkAnim,
                }
              ]}
            >
              <View style={[styles.successCircle, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="checkmark" size={60} color="white" />
              </View>
            </Animated.View>

            <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
              準備完了！
            </Text>
            
            <Text style={[styles.successMessage, { color: theme.colors.text.secondary }]}>
              プロフィール設定が完了しました
            </Text>

            <View style={styles.countdownContainer}>
              <Text style={[styles.countdownText, { color: theme.colors.text.primary }]}>
                {countdown}秒後に自動的に開始します
              </Text>
              
              <View style={[styles.countdownProgressBar, { backgroundColor: theme.colors.border }]}>
                <Animated.View
                  style={[
                    styles.countdownProgressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]}
                />
              </View>
            </View>

            <Button
              onPress={handleSkipWait}
              isFullWidth
              style={{ marginTop: 20 }}
            >
              今すぐ始める
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  profileSummary: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  profileLabel: {
    fontSize: 16,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  insightsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  consistencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consistencyText: {
    fontSize: 14,
  },
  
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  countdownContainer: {
    width: '100%',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    marginBottom: 12,
  },
  countdownProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  countdownProgressFill: {
    height: '100%',
  },
});

export default CompleteScreen;
