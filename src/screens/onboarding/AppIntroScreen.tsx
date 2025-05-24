import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import IntroSlide, { IntroSlideProps } from '@/components/onboarding/IntroSlide';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AppIntro'>;

const { width } = Dimensions.get('window');

// アプリ紹介スライドのデータ
const slides: IntroSlideProps[] = [
  {
    title: 'スワイプで好みを学習',
    description: '左右にスワイプするだけで、あなたの好みを簡単に教えてください。多くのアイテムをチェックするほど、おすすめの精度が上がります。',
    image: require('@/assets/style-casual.png'),
  },
  {
    title: 'パーソナライズされた提案',
    description: 'あなたの好みに基づいて、洋服やコーディネートを提案します。スワイプするほど、あなたにぴったりのアイテムが見つかります。',
    image: require('@/assets/style-mode.png'),
  },
  {
    title: '商品をチェック',
    description: '気に入ったアイテムはすぐに詳細をチェック。そのまま購入サイトへ移動することもできます。',
    image: require('@/assets/style-natural.png'),
  },
];

const AppIntroScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      // 最後のスライドの場合は性別選択画面へ
      navigation.navigate('Gender');
    } else {
      // 次のスライドへ
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: nextIndex,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    // スキップして性別選択画面へ
    navigation.navigate('Gender');
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      // 最初のスライドの場合はウェルカム画面へ戻る
      navigation.goBack();
    } else {
      // 前のスライドへ
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: prevIndex,
      });
      setCurrentIndex(prevIndex);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }: { item: IntroSlideProps }) => {
    return <IntroSlide {...item} />;
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-6">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-gray-500 font-medium">スキップ</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        initialNumToRender={1}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* インジケーター */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>

      <View className="px-6 mb-10">
        <Button isFullWidth onPress={handleNext}>
          {currentIndex === slides.length - 1 ? '始める' : '次へ'}
        </Button>
      </View>
    </View>
  );
};

export default AppIntroScreen;
