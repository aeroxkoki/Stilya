import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useOnboarding, StyleQuizResult } from '@/contexts/OnboardingContext';
import { useStyle } from '@/contexts/ThemeContext';
import { OnboardingStackParamList } from '@/navigation/types';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/common';
import { Product } from '@/types/product';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'StyleQuiz'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const QUIZ_ITEM_COUNT = 10; // 診断で使用する商品数

const StyleQuizScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { 
    gender, 
    stylePreference, 
    setStyleQuizResults, 
    nextStep, 
    prevStep 
  } = useOnboarding();
  
  const { products, loading: productsLoading } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<StyleQuizResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // スワイプアニメーション用
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // 診断用の商品を選定（ジェンダーとスタイル選好に基づく）
  const quizProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    // ジェンダーとスタイル選好でフィルタリング
    let filteredProducts = products.filter(product => {
      // ジェンダーフィルタ
      if (gender && product.gender && product.gender !== 'unisex' && product.gender !== gender) {
        return false;
      }

      // スタイル選好フィルタ（タグベース）
      if (stylePreference.length > 0 && product.tags) {
        const hasMatchingStyle = stylePreference.some(style => 
          product.tags?.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
        );
        if (hasMatchingStyle) return true;
      }

      return true;
    });

    // ランダムに10個選択
    const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, QUIZ_ITEM_COUNT);
  }, [products, gender, stylePreference]);

  // 現在の商品
  const currentProduct = quizProducts[currentIndex];

  // アニメーションスタイル
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity,
    };
  });

  // Yes/Noインジケーターのスタイル
  const likeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.25],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nopeStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.25, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  // スワイプ処理
  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentProduct || isProcessing) return;

    setIsProcessing(true);

    // 結果を記録
    const result: StyleQuizResult = {
      productId: currentProduct.id,
      liked: direction === 'right',
      category: currentProduct.category,
      tags: currentProduct.tags,
    };

    setQuizResults(prev => [...prev, result]);

    // 次の商品へ
    if (currentIndex < quizProducts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // アニメーションをリセット
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotate.value = withSpring(0);
      setIsProcessing(false);
    } else {
      // 診断完了
      handleComplete();
    }
  };

  // 診断完了処理
  const handleComplete = () => {
    const finalResults = [...quizResults];
    if (currentProduct) {
      finalResults.push({
        productId: currentProduct.id,
        liked: translateX.value > 0,
        category: currentProduct.category,
        tags: currentProduct.tags,
      });
    }

    // 結果を保存
    setStyleQuizResults(finalResults);
    nextStep();
    navigation.navigate('AgeGroup');
  };

  // ボタンでのスワイプ
  const handleButtonSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    const targetRotate = direction === 'right' ? 15 : -15;

    translateX.value = withSpring(targetX, {}, () => {
      runOnJS(handleSwipe)(direction);
    });
    rotate.value = withSpring(targetRotate);
  };

  // ジェスチャーハンドラー
  const onGestureEvent = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
    rotate.value = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
      [-15, 15],
      Extrapolate.CLAMP
    );
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        translateX.value = withSpring(targetX, {}, () => {
          runOnJS(handleSwipe)(direction);
        });
      } else {
        // 元の位置に戻る
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    }
  };

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  const handleSkip = () => {
    Alert.alert(
      'スタイル診断をスキップ',
      'スタイル診断をスキップすると、より精度の高いおすすめが表示されない可能性があります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'スキップする', 
          onPress: () => {
            nextStep();
            navigation.navigate('AgeGroup');
          }
        },
      ]
    );
  };

  if (productsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          診断を準備中...
        </Text>
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            商品を読み込めませんでした
          </Text>
          <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            戻る
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.stepIndicator, { color: theme.colors.text.secondary }]}>
            {currentIndex + 1}/{QUIZ_ITEM_COUNT}
          </Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: theme.colors.text.secondary }]}>
              スキップ
            </Text>
          </TouchableOpacity>
        </View>

        {/* タイトル */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            スタイル診断
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            好みの商品を右に、そうでないものを左にスワイプしてください
          </Text>
        </View>

        {/* プログレスバー */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${((currentIndex + 1) / QUIZ_ITEM_COUNT) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* スワイプカード */}
        <View style={styles.cardContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.card, animatedStyle]}>
              <Image
                source={{ uri: currentProduct.thumbnail_url || currentProduct.image_url }}
                style={styles.productImage}
                resizeMode="cover"
              />
              
              {/* Yes/Noインジケーター */}
              <Animated.View style={[styles.likeIndicator, likeStyle]}>
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.nopeIndicator, nopeStyle]}>
                <Text style={styles.nopeText}>NOPE</Text>
              </Animated.View>

              {/* 商品情報 */}
              <View style={[styles.productInfo, { backgroundColor: theme.colors.card.background }]}>
                <Text style={[styles.productBrand, { color: theme.colors.text.secondary }]}>
                  {currentProduct.shop_name}
                </Text>
                <Text 
                  style={[styles.productName, { color: theme.colors.text.primary }]} 
                  numberOfLines={2}
                >
                  {currentProduct.title}
                </Text>
                <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
                  ¥{currentProduct.price.toLocaleString()}
                </Text>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton, { backgroundColor: '#FF4458' }]}
            onPress={() => handleButtonSwipe('left')}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton, { backgroundColor: '#4FC1E8' }]}
            onPress={() => handleButtonSwipe('right')}
            disabled={isProcessing}
          >
            <Ionicons name="heart" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 16,
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '75%',
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  productBrand: {
    fontSize: 12,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#4FC1E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FF4458',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
    gap: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: '#FF4458',
  },
  likeButton: {
    backgroundColor: '#4FC1E8',
  },
});

export default StyleQuizScreen;
