import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Animated as RNAnimated
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useOnboarding, StyleQuizResult } from '@/contexts/OnboardingContext';
import { useStyle } from '@/contexts/ThemeContext';
import { OnboardingStackParamList } from '@/navigation/types';
import { useProducts } from '@/hooks/useProducts';
import OnboardingSwipeCard from '@/components/onboarding/OnboardingSwipeCard';
import { Product } from '@/types/product';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UnifiedSwipe'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;
const TOTAL_CARDS = 8;
const CARD_STACK_OFFSET = 12; // カードスタックのオフセット
const MAX_VISIBLE_CARDS = 3; // 表示する最大カード数

interface CardAnimationState {
  translateX: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  rotate: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

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

  // カードごとのアニメーション値を管理
  const [cardAnimations, setCardAnimations] = useState<CardAnimationState[]>([]);

  // 初期化
  useEffect(() => {
    const animations: CardAnimationState[] = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
      animations.push({
        translateX: useSharedValue(0),
        translateY: useSharedValue(0),
        rotate: useSharedValue(0),
        scale: useSharedValue(i < MAX_VISIBLE_CARDS ? 1 - (i * 0.05) : 0),
        opacity: useSharedValue(i < MAX_VISIBLE_CARDS ? 1 : 0),
      });
    }
    setCardAnimations(animations);
  }, []);

  // 商品選定ロジック
  const selectedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // チュートリアル用の商品（最初の2枚）
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
      if (tutorialProducts.some(tp => tp.id === product.id)) return false;
      
      if (stylePreference.length > 0 && product.tags) {
        return stylePreference.some(style => 
          product.tags?.some(tag => tag.toLowerCase().includes(style.toLowerCase()))
        );
      }
      return true;
    });

    personalizedProducts = personalizedProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return [...tutorialProducts, ...personalizedProducts];
  }, [products, gender, stylePreference]);

  // 進捗フィードバックの表示
  const showIntermediateFeedback = useCallback((index: number, results: StyleQuizResult[]) => {
    let message = '';
    
    if (index === 3) {
      const likedCount = results.filter(r => r.liked).length;
      if (likedCount >= 3) {
        message = 'いいね！素敵なセンスです✨';
      } else if (likedCount >= 1) {
        message = '好みが分かってきました👍';
      } else {
        message = 'もう少し見てみましょう🔍';
      }
    } else if (index === 5) {
      message = 'あと少しで完了です！🎯';
    }

    if (message) {
      setProgressMessage(message);
      setShowProgressFeedback(true);
      setTimeout(() => setShowProgressFeedback(false), 2000);
    }
  }, []);

  // カードスタックの位置を更新
  const updateCardStack = useCallback(() => {
    if (!cardAnimations.length) return;

    cardAnimations.forEach((anim, index) => {
      const relativeIndex = index - currentIndex;
      
      if (relativeIndex < 0) {
        // すでにスワイプされたカード
        anim.opacity.value = withTiming(0, { duration: 200 });
        anim.scale.value = withTiming(0, { duration: 200 });
      } else if (relativeIndex < MAX_VISIBLE_CARDS) {
        // 表示されるカード
        const targetScale = 1 - (relativeIndex * 0.05);
        const targetY = relativeIndex * CARD_STACK_OFFSET;
        
        anim.translateY.value = withSpring(targetY, {
          damping: 20,
          stiffness: 100,
        });
        anim.scale.value = withSpring(targetScale, {
          damping: 20,
          stiffness: 100,
        });
        anim.opacity.value = withTiming(1, { duration: 300 });
      } else {
        // まだ表示されないカード
        anim.opacity.value = 0;
        anim.scale.value = 0;
      }
    });
  }, [cardAnimations, currentIndex]);

  // currentIndex変更時にカードスタックを更新
  useEffect(() => {
    updateCardStack();
  }, [currentIndex, updateCardStack]);

  // スワイプ完了処理
  const handleSwipeComplete = useCallback(async (direction: 'left' | 'right') => {
    if (!selectedProducts[currentIndex] || isProcessing) return;

    const currentProduct = selectedProducts[currentIndex];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 結果を記録
    const result: StyleQuizResult = {
      productId: currentProduct.id,
      liked: direction === 'right',
      category: currentProduct.category,
      tags: currentProduct.tags,
      isTutorial: currentIndex < 2,
    };

    const newResults = [...swipeResults, result];
    setSwipeResults(newResults);

    // チュートリアルオーバーレイを非表示
    if (currentIndex === 1) {
      setShowTutorialOverlay(false);
    }

    // 中間フィードバック
    showIntermediateFeedback(currentIndex, newResults);

    // 次のカードへ
    if (currentIndex < selectedProducts.length - 1) {
      // 少し待ってから次のカードを表示
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsProcessing(false);
      }, 100);
    } else {
      // 完了処理
      await setStyleQuizResults(newResults);
      nextStep();
      navigation.navigate('StyleReveal');
    }
  }, [currentIndex, isProcessing, selectedProducts, swipeResults, showIntermediateFeedback, setStyleQuizResults, nextStep, navigation]);

  // ボタンでのスワイプ
  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    if (!cardAnimations[currentIndex] || isProcessing) return;

    setIsProcessing(true);
    const anim = cardAnimations[currentIndex];
    const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    const targetRotate = direction === 'right' ? 30 : -30;

    // スワイプアニメーション
    anim.translateX.value = withTiming(targetX, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    }, () => {
      runOnJS(handleSwipeComplete)(direction);
    });
    
    anim.rotate.value = withTiming(targetRotate, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    anim.opacity.value = withTiming(0, {
      duration: 400,
    });
  }, [cardAnimations, currentIndex, isProcessing, handleSwipeComplete]);

  // カード描画コンポーネント
  const renderCard = useCallback((index: number) => {
    if (!selectedProducts[index] || !cardAnimations[index]) return null;

    const product = selectedProducts[index];
    const anim = cardAnimations[index];
    const isCurrentCard = index === currentIndex;

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: anim.translateX.value },
          { translateY: anim.translateY.value },
          { rotate: `${anim.rotate.value}deg` },
          { scale: anim.scale.value },
        ],
        opacity: anim.opacity.value,
      };
    });

    // Like/Nopeインジケーター（現在のカードのみ）
    const likeStyle = useAnimatedStyle(() => {
      const opacity = isCurrentCard
        ? interpolate(
            anim.translateX.value,
            [0, SCREEN_WIDTH * 0.25],
            [0, 1],
            Extrapolate.CLAMP
          )
        : 0;
      return { opacity };
    });

    const nopeStyle = useAnimatedStyle(() => {
      const opacity = isCurrentCard
        ? interpolate(
            anim.translateX.value,
            [-SCREEN_WIDTH * 0.25, 0],
            [1, 0],
            Extrapolate.CLAMP
          )
        : 0;
      return { opacity };
    });

    // ジェスチャーハンドラー
    const onGestureEvent = (event: any) => {
      if (!isCurrentCard || isProcessing) return;

      anim.translateX.value = event.nativeEvent.translationX;
      anim.translateY.value = event.nativeEvent.translationY * 0.5; // Y軸の動きを制限
      anim.rotate.value = interpolate(
        anim.translateX.value,
        [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
        [-20, 20],
        Extrapolate.CLAMP
      );
    };

    const onHandlerStateChange = (event: any) => {
      if (!isCurrentCard || isProcessing) return;

      if (event.nativeEvent.state === State.END) {
        const { translationX, velocityX } = event.nativeEvent;

        // 速度または距離でスワイプ判定
        if (
          Math.abs(translationX) > SWIPE_THRESHOLD ||
          Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD
        ) {
          setIsProcessing(true);
          const direction = translationX > 0 ? 'right' : 'left';
          const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
          const targetRotate = direction === 'right' ? 30 : -30;

          // カードを画面外へ飛ばす
          anim.translateX.value = withTiming(targetX, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          }, () => {
            runOnJS(handleSwipeComplete)(direction);
          });

          anim.rotate.value = withTiming(targetRotate, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          });

          anim.opacity.value = withTiming(0, {
            duration: 300,
          });
        } else {
          // 元の位置に戻る（スムーズに）
          anim.translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 100,
          });
          anim.translateY.value = withSpring(index === currentIndex ? 0 : (index - currentIndex) * CARD_STACK_OFFSET, {
            damping: 20,
            stiffness: 100,
          });
          anim.rotate.value = withSpring(0, {
            damping: 20,
            stiffness: 100,
          });
        }
      }
    };

    return (
      <PanGestureHandler
        key={`card-${index}`}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isCurrentCard && !isProcessing}
      >
        <Animated.View style={[styles.card, animatedStyle]}>
          <OnboardingSwipeCard
            product={product}
            testID={`unified-swipe-card-${index}`}
          />
          
          {/* Like/Nopeインジケーター */}
          {isCurrentCard && (
            <>
              <Animated.View style={[styles.likeIndicator, likeStyle]}>
                <Text style={styles.likeText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.nopeIndicator, nopeStyle]}>
                <Text style={styles.nopeText}>NOPE</Text>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  }, [selectedProducts, cardAnimations, currentIndex, isProcessing, handleSwipeComplete]);

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  if (productsLoading || cardAnimations.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
          準備中...
        </Text>
      </View>
    );
  }

  if (!selectedProducts.length) {
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

        {/* カードスタック */}
        <View style={styles.cardContainer}>
          {selectedProducts.map((_, index) => {
            // 現在のインデックスから最大3枚まで表示
            if (index >= currentIndex && index < currentIndex + MAX_VISIBLE_CARDS) {
              return renderCard(index);
            }
            return null;
          }).reverse()} {/* 逆順で描画することで、最前面のカードが最初に来る */}
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

        {/* チュートリアルオーバーレイ */}
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
          <RNAnimated.View style={styles.feedbackContainer}>
            <View style={[styles.feedbackBubble, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.feedbackText}>{progressMessage}</Text>
            </View>
          </RNAnimated.View>
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
    position: 'absolute',
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
