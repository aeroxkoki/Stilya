import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Style'>;

// スタイルの選択肢
interface StyleOption {
  id: string;
  name: string;
  description: string;
  image: any; // 実際のプロジェクトではImageSourcePropType型を使用
}

const styleOptions: StyleOption[] = [
  {
    id: 'casual',
    name: 'カジュアル',
    description: '日常的でリラックスした着こなし',
    image: require('@/assets/style-casual.png'),
  },
  {
    id: 'street',
    name: 'ストリート',
    description: '個性的で都会的なスタイル',
    image: require('@/assets/style-street.png'),
  },
  {
    id: 'mode',
    name: 'モード',
    description: 'モノトーンを基調としたスタイリッシュな装い',
    image: require('@/assets/style-mode.png'),
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '自然体で優しい雰囲気のコーディネート',
    image: require('@/assets/style-natural.png'),
  },
  {
    id: 'classic',
    name: 'クラシック',
    description: '上品で落ち着いた大人のスタイル',
    image: require('@/assets/style-classic.png'),
  },
  {
    id: 'feminine',
    name: 'フェミニン',
    description: '女性らしさを強調した華やかな装い',
    image: require('@/assets/style-feminine.png'),
  },
];

const StyleScreen: React.FC<Props> = ({ navigation }) => {
  const { stylePreference, setStylePreference, nextStep, prevStep } = useOnboardingStore();
  const [selectedStyles, setSelectedStyles] = useState<string[]>(stylePreference);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };

  const handleNext = () => {
    setStylePreference(selectedStyles);
    nextStep();
    navigation.navigate('AgeGroup');
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
          <Text className="text-lg font-medium">2/4</Text>
        </View>

        {/* タイトル */}
        <View className="px-6 mb-4">
          <Text className="text-2xl font-bold mb-2">好きなスタイルを選んでください</Text>
          <Text className="text-gray-500">
            複数選択可能です。あなたの好みに合わせたアイテムを提案します。
          </Text>
        </View>

        {/* スタイル選択 */}
        <ScrollView className="flex-1 px-6">
          <View className="flex-row flex-wrap justify-between">
            {styleOptions.map(style => (
              <TouchableOpacity
                key={style.id}
                className="w-[48%] mb-4"
                activeOpacity={0.7}
                onPress={() => toggleStyle(style.id)}
              >
                <View
                  className={`relative rounded-lg overflow-hidden ${
                    selectedStyles.includes(style.id) ? 'border-2 border-primary' : 'border border-gray-200'
                  }`}
                >
                  <Image 
                    source={style.image} 
                    className="w-full h-32"
                    resizeMode="cover"
                  />
                  <View className="absolute top-0 right-0 m-2">
                    {selectedStyles.includes(style.id) && (
                      <View className="bg-primary rounded-full p-1">
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View className="p-3 bg-white">
                    <Text className={`font-medium ${selectedStyles.includes(style.id) ? 'text-primary' : 'text-gray-800'}`}>
                      {style.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                      {style.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 次へボタン */}
        <View className="p-6">
          <Button
            isFullWidth
            onPress={handleNext}
            disabled={selectedStyles.length === 0}
          >
            次へ
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StyleScreen;
