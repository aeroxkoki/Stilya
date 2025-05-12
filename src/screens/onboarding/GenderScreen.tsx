import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/common';
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
        <View className="space-y-4 mb-8">
          <TouchableOpacity
            onPress={() => setGender('male')}
            activeOpacity={0.7}
          >
            <Card
              className={`p-6 ${gender === 'male' ? 'border-2 border-primary' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-medium">男性</Text>
                  <Text className="text-gray-500">メンズスタイル</Text>
                </View>
                {gender === 'male' && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setGender('female')}
            activeOpacity={0.7}
          >
            <Card
              className={`p-6 ${gender === 'female' ? 'border-2 border-primary' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-medium">女性</Text>
                  <Text className="text-gray-500">レディーススタイル</Text>
                </View>
                {gender === 'female' && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setGender('other')}
            activeOpacity={0.7}
          >
            <Card
              className={`p-6 ${gender === 'other' ? 'border-2 border-primary' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-medium">その他</Text>
                  <Text className="text-gray-500">ユニセックススタイル</Text>
                </View>
                {gender === 'other' && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* 次へボタン */}
        <Button
          isFullWidth
          onPress={handleNext}
          disabled={!gender}
          className="mt-auto"
        >
          次へ
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default GenderScreen;
