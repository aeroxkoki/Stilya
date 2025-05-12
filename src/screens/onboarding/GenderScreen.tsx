import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { SelectionButton } from '@/components/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Gender'>;

const GenderScreen: React.FC<Props> = ({ navigation }) => {
  const { gender, setGender, nextStep } = useOnboardingStore();

  const handleNext = () => {
    nextStep();
    navigation.navigate('Style');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6 flex-1">
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-medium">1/4</Text>
        </View>

        {/* タイトル */}
        <Text className="text-2xl font-bold mb-2">あなたの性別を教えてください</Text>
        <Text className="text-gray-500 mb-8">
          より適切なスタイル提案のために使用されます
        </Text>

        {/* 選択肢 */}
        <View className="mb-8">
          <SelectionButton
            title="男性"
            subtitle="メンズスタイル"
            isSelected={gender === 'male'}
            onPress={() => setGender('male')}
          />

          <SelectionButton
            title="女性"
            subtitle="レディーススタイル"
            isSelected={gender === 'female'}
            onPress={() => setGender('female')}
          />

          <SelectionButton
            title="その他"
            subtitle="ユニセックススタイル"
            isSelected={gender === 'other'}
            onPress={() => setGender('other')}
          />
        </View>

        {/* 次へボタン */}
        <Button
          isFullWidth
          onPress={handleNext}
          disabled={\!gender}
          className="mt-auto"
        >
          次へ
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default GenderScreen;
