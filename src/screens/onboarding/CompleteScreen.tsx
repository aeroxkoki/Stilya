import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList, fashionStyleToTheme, FashionStyle, StyleType } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Complete'>;

const CompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, setStyleType } = useStyle();
  const { gender, stylePreference, ageGroup, saveUserProfile, isLoading, error } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* タイトル */}
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="checkmark" size={48} color={theme.colors.success} />
          </View>
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

        {/* エラーメッセージ */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        )}

        {/* 完了ボタン */}
        <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
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
    borderTopWidth: 1,
  },
});

export default CompleteScreen;
