import React, { useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Complete'>;

const CompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { gender, stylePreference, ageGroup, saveUserProfile, isLoading, error } = useOnboardingStore();
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
    return stylePreference.map(style => styleMap[style] || style).join('、');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-10 justify-between">
        {/* タイトル */}
        <View className="items-center">
          <View className="bg-green-100 rounded-full p-4 mb-4">
            <Ionicons name="checkmark" size={48} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-center mb-2">
            プロフィール設定完了！
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            あなたの好みに合わせた商品をご提案します
          </Text>
        </View>

        {/* プロフィール概要 */}
        <View className="bg-gray-50 rounded-lg p-6 mb-8">
          <Text className="text-lg font-bold mb-4">プロフィール概要</Text>
          
          <View className="mb-4">
            <Text className="text-gray-500 mb-1">性別</Text>
            <Text className="text-gray-800 font-medium">
              {gender ? genderMap[gender] || gender : '未設定'}
            </Text>
          </View>
          
          <View className="mb-4">
            <Text className="text-gray-500 mb-1">好きなスタイル</Text>
            <Text className="text-gray-800 font-medium">
              {stylePreference.length > 0 ? getStyleNames() : '未設定'}
            </Text>
          </View>
          
          <View>
            <Text className="text-gray-500 mb-1">年代</Text>
            <Text className="text-gray-800 font-medium">
              {ageGroup ? ageGroupMap[ageGroup] || ageGroup : '未設定'}
            </Text>
          </View>
        </View>

        {/* エラーメッセージ */}
        {error && (
          <View className="mb-4 p-3 bg-red-50 rounded-md">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        {/* 完了ボタン */}
        <Button
          isFullWidth
          onPress={handleComplete}
          isLoading={isLoading || isSaving}
        >
          始める
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default CompleteScreen;
