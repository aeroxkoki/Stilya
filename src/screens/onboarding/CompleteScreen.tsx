import React, { useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Complete'>;

const CompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { gender, stylePreference, ageGroup, saveUserProfile, isLoading, error } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);

  // スタイル名のマッピング
  const styleMap: Record<string, string> = {
    casual: 'カジュアル',
    street: 'ストリート',
    mode: 'モード',
    natural: 'ナチュラル',
    classic: 'クラシック',
    feminine: 'フェミニン',
  };

  // 年代のマッピング
  const ageGroupMap: Record<string, string> = {
    teens: '10代',
    '20s': '20代',
    '30s': '30代',
    '40s': '40代',
    '50s': '50代',
    '60plus': '60代以上',
  };

  // 性別のマッピング
  const genderMap: Record<string, string> = {
    male: '男性',
    female: '女性',
    other: 'その他',
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveUserProfile();
      // 成功時は自動的にMainスタックに遷移（AppNavigatorで処理）
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'エラー',
        'プロフィールの保存中にエラーが発生しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  // 選択したスタイルの名前を取得
  const getStyleNames = () => {
    return stylePreference.map((style: any) => styleMap[style] || style).join('、');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* タイトル */}
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark" size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>
            プロフィール設定完了！
          </Text>
          <Text style={styles.subtitle}>
            あなたの好みに合わせた商品をご提案します
          </Text>
        </View>

        {/* プロフィール概要 */}
        <View style={styles.profileSummary}>
          <Text style={styles.sectionTitle}>プロフィール概要</Text>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>性別</Text>
            <Text style={styles.profileValue}>
              {gender ? genderMap[gender] || gender : '未設定'}
            </Text>
          </View>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>好きなスタイル</Text>
            <Text style={styles.profileValue}>
              {stylePreference.length > 0 ? getStyleNames() : '未設定'}
            </Text>
          </View>
          
          <View style={styles.profileItem}>
            <Text style={styles.profileLabel}>年代</Text>
            <Text style={styles.profileValue}>
              {ageGroup ? ageGroupMap[ageGroup] || ageGroup : '未設定'}
            </Text>
          </View>
        </View>

        {/* エラーメッセージ */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 完了ボタン */}
        <View style={styles.buttonContainer}>
          <Button
            isFullWidth
            onPress={handleComplete}
            isLoading={isLoading || isSaving}
          >
            始める
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
  },
  profileSummary: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});

export default CompleteScreen;
