import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import IntroSlide, { IntroSlideProps } from '@/components/onboarding/IntroSlide';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
import { StylePlaceholder } from '@/components/common/ImagePlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AppIntro'>;

const { width } = Dimensions.get('window');

// アプリ紹介スライドのデータ（1枚に削減）
const slides: IntroSlideProps[] = [
  {
    title: 'スワイプで、あなたの"好き"が見つかる',
    description: '左右にスワイプするだけで、AIがあなたの好みを学習。使うほど精度が上がります。',
    styleName: 'mode', // プレースホルダー用のスタイル名
  },
];

const AppIntroScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useStyle();

  // 自動遷移の追加（3秒後に自動で次へ）
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Gender');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.colors.text.secondary }]}>スキップ</Text>
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
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button isFullWidth onPress={handleNext}>
          {currentIndex === slides.length - 1 ? '始める' : '次へ'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  skipText: {
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});

export default AppIntroScreen;
