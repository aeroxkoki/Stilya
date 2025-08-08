import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Animated
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import ReanimatedView, {
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
import { SwipeCard } from '@/components/swipe';
import { Product } from '@/types/product';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UnifiedSwipe'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const TOTAL_CARDS = 8; // 統合スワイプの枚数

const UnifiedSwipeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { 
    gender, 
    stylePreference, 
    ageGroup,
    setStyleQuizResults, 
    nextStep,
    prevStep 
  } = useOnboarding();
  
  const { products, isLoading: productsLoading } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeResults, setSwipeResults] = useState<StyleQuizResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(true);
  const [showProgressFeedback, setShowProgressFeedback] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  // アニメーション値
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  // 商品選定ロジック（8枚構成）
  const selectedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // チュートリアル用の商品（最初の2枚）- 汎用的な商品を選択
    const tutorialProducts: Product[] = [];
    const casualProducts = products.filter(p => 
      p.tags?.some(tag => tag.toLowerCase().includes('casual') || tag.toLowerCase().includes('ベーシック'))
    );
    
    if (casualProducts.length >= 2) {
      tutorialProducts.push(...casualProducts.slice(0, 2));
    } else {
      tutorialProducts.push(...products.slice(0, 2));
    }

    // パーソナライズされた商品（残り6枚）
    let personalizedProducts = products.filter(product => {
      // チュートリアル商品を除外
      if (tutorialProducts.some(tp => tp.id === product.id)) return false;
      
      // スタイル選好に基づくフィルタリング
      if (stylePreference.length > 0 && product.tags) {
        return stylePreference.some(style => 
          product.tags?.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
        );
      }
      return true;
    });

    // ランダムにシャッフルして6枚選択
    personalizedProducts = personalizedProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return [...tutorialProducts, ...personalizedProducts];
  }, [products, gender, stylePreference]);

  // 現在の商品
  const currentProduct = selectedProducts[currentIndex];

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

  // Like/Nopeインジケーター
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

  // 進捗フィードバックの表示
  const showIntermediateFeedback = useCallback((index: number, results: StyleQuizResult[]) => {
    let message = '';
    
    if (index === 3) {
      // 4枚目完了時
      const likedCount = results.filter(r => r.liked).length;
      if (likedCount >= 3) {
        message = 'いいね！素敵なセンスです✨';
      } else if (likedCount >= 1) {
        message = '好みが分かってきました👍';
      } else {
        message = 'もう少し見てみましょう🔍';
      }
    } else if (index === 5) {
      // 6枚目完了時
      message = 'あと少しで完了です！🎯';
    }

    if (message) {
      setProgressMessage(message);
      setShowProgressFeedback(true);
      setTimeout(() => setShowProgressFeedback(false), 2000);
    }
  }, []);

  // スワイプ処理
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentProduct || isProcessing) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 結果を記録
    const result: StyleQuizResult = {
      productId: currentProduct.id,
      liked: direction === 'right',
      category: currentProduct.category,
      tags: currentProduct.tags,
      isTutorial: currentIndex < 2, // 最初の2枚はチュートリアル
    };

    const newResults = [...swipeResults, result];
    setSwipeResults(newResults);

    // チュートリアルオーバーレイを非表示（3枚目から）
    if (currentIndex === 1) {
      setShowTutorialOverlay(false);
    }

    // 中間フィードバック
    showIntermediateFeedback(currentIndex, newResults);

    // 次の商品へ
    if (currentIndex < selectedProducts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // アニメーションをリセット
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotate.value = withSpring(0);
      setIsProcessing(false);
    } else {
      // 完了処理
      handleComplete(newResults);
    }
  }, [currentProduct, currentIndex, isProcessing, swipeResults, selectedProducts, showIntermediateFeedback]);

  // 完了処理
  const handleComplete = async (results: StyleQuizResult[]) => {
    // 診断結果を保存
    await setStyleQuizResults(results);
    nextStep();
    navigation.navigate('StyleReveal');
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

  if (productsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          準備中...
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
            2/3
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* タイトル */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {currentIndex < 2 ? 'スワイプを練習' : '好みを教えてください'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            気に入ったら右へ、そうでなければ左へスワイプ
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
                  width: `${((currentIndex + 1) / TOTAL_CARDS) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
            {currentIndex + 1} / {TOTAL_CARDS}
          </Text>
        </View>

        {/* スワイプカード */}
        <View style={styles.cardContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <ReanimatedView style={[styles.card, animatedStyle]}>
              <SwipeCard
                product={currentProduct}
                testID="unified-swipe-card"
              />
              
              {/* Like/Nopeインジケーター */}
              <ReanimatedView style={[styles.likeIndicator, likeStyle]}>
                <Text style={styles.likeText}>LIKE</Text>
              </ReanimatedView>
              <ReanimatedView style={[styles.nopeIndicator, nopeStyle]}>
                <Text style={styles.nopeText}>NOPE</Text>
              </ReanimatedView>
            </ReanimatedView>
          </PanGestureHandler>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={() => handleButtonSwipe('left')}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleButtonSwipe('right')}
            disabled={isProcessing}
          >
            <Ionicons name="heart" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* チュートリアルオーバーレイ（最初の2枚） */}
        {showTutorialOverlay && currentIndex < 2 && (
          <View style={styles.tutorialOverlay} pointerEvents="none">
            <View style={[styles.tutorialBubble, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.tutorialText}>
                {currentIndex === 0 
                  ? 'カードを左右にスワイプするか、下のボタンをタップしてください'
                  : 'もう一度練習してみましょう！'}
              </Text>
            </View>
          </View>
        )}

        {/* 進捗フィードバック */}
        {showProgressFeedback && (
          <Animated.View style={styles.feedbackContainer}>
            <View style={[styles.feedbackBubble, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.feedbackText}>{progressMessage}</Text>
            </View>
          </Animated.View>
        )}
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
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.55,
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
  tutorialOverlay: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tutorialBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  tutorialText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackBubble: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UnifiedSwipeScreen;
