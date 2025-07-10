import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { SelectionButton } from '@/components/onboarding';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Gender'>;

const GenderScreen: React.FC<Props> = ({ navigation }) => {
  const { gender, setGender, nextStep } = useOnboarding();

  const handleNext = () => {
    nextStep();
    navigation.navigate('Style');
  };

  return (
    <SafeAreaView >
      <View >
        {/* ヘッダー */}
        <View >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text >1/5</Text>
        </View>

        {/* タイトル */}
        <Text >あなたの性別を教えてください</Text>
        <Text >
          より適切なスタイル提案のために使用されます
        </Text>

        {/* 選択肢 */}
        <View >
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
          disabled={!gender}
          
        >
          次へ
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default GenderScreen;