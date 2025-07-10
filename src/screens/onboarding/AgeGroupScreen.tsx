import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { SelectionButton } from '@/components/onboarding';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AgeGroup'>;

// 年代の選択肢（DBスキーマに合わせて修正）
const ageGroups = [
  { id: 'teens', label: '10代' },
  { id: 'twenties', label: '20代' },
  { id: 'thirties', label: '30代' },
  { id: 'forties', label: '40代' },
  { id: 'fifties_plus', label: '50代以上' },
];

const AgeGroupScreen: React.FC<Props> = ({ navigation }) => {
  const { ageGroup, setAgeGroup, nextStep, prevStep } = useOnboarding();

  const handleNext = () => {
    nextStep();
    navigation.navigate('Complete');
  };

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  return (
    <SafeAreaView >
      <View >
        {/* ヘッダー */}
        <View >
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text >4/5</Text>
        </View>

        {/* タイトル */}
        <View >
          <Text >あなたの年代を教えてください</Text>
          <Text >
            年代に合わせたスタイル提案のために使用されます
          </Text>
        </View>

        {/* 年代選択 */}
        <ScrollView >
          {ageGroups.map(age => (
            <SelectionButton
              key={age.id}
              title={age.label}
              isSelected={ageGroup === age.id}
              onPress={() => setAgeGroup(age.id)}
            />
          ))}
        </ScrollView>

        {/* 次へボタン */}
        <View >
          <Button
            isFullWidth
            onPress={handleNext}
            disabled={!ageGroup}
          >
            次へ
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AgeGroupScreen;
