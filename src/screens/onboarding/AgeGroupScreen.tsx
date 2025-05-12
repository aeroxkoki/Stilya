import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/common';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AgeGroup'>;

// 年代の選択肢
const ageGroups = [
  { id: 'teens', label: '10代' },
  { id: '20s', label: '20代' },
  { id: '30s', label: '30代' },
  { id: '40s', label: '40代' },
  { id: '50s', label: '50代' },
  { id: '60plus', label: '60代以上' },
];

const AgeGroupScreen: React.FC<Props> = ({ navigation }) => {
  const { ageGroup, setAgeGroup, nextStep, prevStep } = useOnboardingStore();

  const handleNext = () => {
    nextStep();
    navigation.navigate('Complete');
  };

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between p-6 mb-2">
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-medium">3/4</Text>
        </View>

        {/* タイトル */}
        <View className="px-6 mb-6">
          <Text className="text-2xl font-bold mb-2">あなたの年代を教えてください</Text>
          <Text className="text-gray-500">
            年代に合わせたスタイル提案のために使用されます
          </Text>
        </View>

        {/* 年代選択 */}
        <ScrollView className="flex-1 px-6">
          <View className="space-y-3">
            {ageGroups.map(age => (
              <TouchableOpacity
                key={age.id}
                activeOpacity={0.7}
                onPress={() => setAgeGroup(age.id)}
              >
                <Card
                  className={`p-4 ${ageGroup === age.id ? 'border-2 border-primary bg-blue-50' : ''}`}
                  variant="outlined"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-lg ${ageGroup === age.id ? 'font-bold text-primary' : 'font-medium text-gray-700'}`}>
                      {age.label}
                    </Text>
                    {ageGroup === age.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 次へボタン */}
        <View className="p-6">
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
