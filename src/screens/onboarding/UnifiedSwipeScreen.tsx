import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
const TOTAL_CARDS = 5; // 8枚から5枚に削減（UX向上のため）
const CARD_STACK_OFFSET = 12;
const MAX_VISIBLE_CARDS = 3;

// カードアニメーション用のフック
const useCardAnimation = (index: number, isVisible: boolean) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(isVisible ? index * CARD_STACK_OFFSET : 0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(isVisible ? 1 - (index * 0.05) : 0);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  return { translateX, translateY, rotate, scale, opacity };
};

const UnifiedSwipeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { 
    gender, 
    stylePreference, 
    ageGroup,
    setStyleQuizResults,
    saveUserProfile, 
    nextStep,
    prevStep 
  } = useOnboarding();
  
  const { products, isLoading: productsLoading } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexShared = useSharedValue(0); // Shared value for animations
  const [swipeResults, setSwipeResults] = useState<StyleQuizResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(true);
  const [showProgressFeedback, setShowProgressFeedback] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // 各カードのアニメーション値を初期化（5枚分に最適化）
  const card0Anim = useCardAnimation(0, true);
  const card1Anim = useCardAnimation(1, true);
  const card2Anim = useCardAnimation(2, true);
  const card3Anim = useCardAnimation(3, false);
  const card4Anim = useCardAnimation(4, false);

  const cardAnimations = [
    card0Anim, card1Anim, card2Anim, card3Anim, card4Anim
  ];

  // currentIndexが変更されたらshared valueも更新
  useEffect(() => {
    currentIndexShared.value = currentIndex;
  }, [currentIndex, currentIndexShared]);

  // 初期化完了を設定
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 改善された商品選定ロジック（スタイル選択重視）
  const selectedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    console.log('[UnifiedSwipe] Starting product selection with:', {
      gender,
      stylePreference,
      ageGroup,
      totalProducts: products.length
    });

    // 現在は女性用商品のみなので、性別フィルタリングは簡素化
    // 将来男性用商品が追加されたら、ここのロジックを有効化する
    const genderFilteredProducts = products; // 今は全商品を対象にする

    console.log('[UnifiedSwipe] Available products:', genderFilteredProducts.length);

    // チュートリアル用の商品（最初の2枚）
    const tutorialProducts: Product[] = [];
    const casualProducts = genderFilteredProducts.filter(p => 
      p.tags?.some(tag => 
        tag.toLowerCase().includes('casual') || 
        tag.toLowerCase().includes('カジュアル') ||
        tag.toLowerCase().includes('ベーシック')
      )
    );
    
    if (casualProducts.length >= 2) {
      tutorialProducts.push(...casualProducts.slice(0, 2));
    } else {
      // カジュアル商品が足りない場合は任意の商品を使用
      tutorialProducts.push(...genderFilteredProducts.slice(0, 2));
    }

    console.log('[UnifiedSwipe] Tutorial products selected:', tutorialProducts.length);

    // パーソナライズされた商品（残り3枚）
    let personalizedProducts: Product[] = [];
    
    if (stylePreference && stylePreference.length > 0) {
      // スタイル選択がある場合、優先的にそのスタイルの商品を選ぶ
      personalizedProducts = genderFilteredProducts.filter(product => {
        // チュートリアル商品を除外
        if (tutorialProducts.some(tp => tp.id === product.id)) return false;
        
        // 商品のタグをチェック
        if (!product.tags) return false;
        
        // スタイルが一致するか確認
        return stylePreference.some(style => {
          const styleLower = style.toLowerCase();
          return product.tags?.some(tag => {
            const tagLower = tag.toLowerCase();
            // より柔軟なマッチング
            if (styleLower === 'casual') {
              return tagLower.includes('カジュアル') || 
                     tagLower.includes('casual') ||
                     tagLower.includes('リラックス') ||
                     tagLower.includes('ベーシック');
            } else if (styleLower === 'street') {
              return tagLower.includes('ストリート') || 
                     tagLower.includes('street') ||
                     tagLower.includes('スポーティ') ||
                     tagLower.includes('アーバン');
            } else if (styleLower === 'mode') {
              return tagLower.includes('モード') || 
                     tagLower.includes('mode') ||
                     tagLower.includes('モノトーン') ||
                     tagLower.includes('ミニマル');
            } else if (styleLower === 'natural') {
              return tagLower.includes('ナチュラル') || 
                     tagLower.includes('natural') ||
                     tagLower.includes('リネン') ||
                     tagLower.includes('オーガニック');
            } else if (styleLower === 'feminine') {
              return tagLower.includes('フェミニン') || 
                     tagLower.includes('feminine') || 
                     tagLower.includes('ガーリー') ||
                     tagLower.includes('レース') ||
                     tagLower.includes('フリル');
            } else if (styleLower === 'classic') {
              return tagLower.includes('クラシック') || 
                     tagLower.includes('classic') || 
                     tagLower.includes('トラッド') ||
                     tagLower.includes('エレガント');
            }
            // 直接一致
            return tagLower.includes(styleLower);
          });
        });
      });
      
      console.log('[UnifiedSwipe] Products matching style preference:', personalizedProducts.length);
    }
    
    // スタイルに一致する商品が少ない場合は、すべての商品から選ぶ
    if (personalizedProducts.length < 3) {
      const additionalProducts = genderFilteredProducts.filter(product => {
        // チュートリアル商品と既に選ばれた商品を除外
        return !tutorialProducts.some(tp => tp.id === product.id) &&
               !personalizedProducts.some(pp => pp.id === product.id);
      });
      
      // 不足分を追加
      const needed = 3 - personalizedProducts.length;
      personalizedProducts = [
        ...personalizedProducts,
        ...additionalProducts.slice(0, needed)
      ];
    }

    // 年齢層も考慮（タグにある場合）
    if (ageGroup) {
      const ageFilteredProducts = personalizedProducts.filter(product => {
        const tags = product.tags || [];
        // 年齢層タグがない商品は表示、ある場合は一致するもののみ
        const hasAgeTag = tags.some(tag => 
          tag.includes('10代') || tag.includes('20代') || 
          tag.includes('30代') || tag.includes('40代')
        );
        
        if (!hasAgeTag) return true;
        
        if (ageGroup === '10-19') {
          return tags.some(tag => tag.includes('10代'));
        } else if (ageGroup === '20-29') {
          return tags.some(tag => tag.includes('20代'));
        } else if (ageGroup === '30-39') {
          return tags.some(tag => tag.includes('30代'));
        } else if (ageGroup === '40+') {
          return tags.some(tag => tag.includes('40代'));
        }
        return true;
      });
      
      if (ageFilteredProducts.length >= 3) {
        personalizedProducts = ageFilteredProducts;
      }
    }

    console.log('[UnifiedSwipe] Personalized products after filtering:', personalizedProducts.length);

    // ランダムに3枚選択
    personalizedProducts = personalizedProducts
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // 5枚になるように調整
    const allSelectedProducts = [...tutorialProducts, ...personalizedProducts];
    
    // 不足分を補充
    while (allSelectedProducts.length < TOTAL_CARDS && genderFilteredProducts.length > allSelectedProducts.length) {
      const remainingProducts = genderFilteredProducts.filter(p => 
        !allSelectedProducts.some(sp => sp.id === p.id)
      );
      if (remainingProducts.length > 0) {
        allSelectedProducts.push(remainingProducts[Math.floor(Math.random() * remainingProducts.length)]);
      } else {
        break;
      }
    }

    const finalSelection = allSelectedProducts.slice(0, TOTAL_CARDS);
    console.log('[UnifiedSwipe] Final product selection:', finalSelection.length);
    
    return finalSelection;
  }, [products, gender, stylePreference, ageGroup]);

  // 進捗フィードバックの表示（5枚に最適化）
  const showIntermediateFeedback = useCallback((index: number, results: StyleQuizResult[]) => {
    let message = '';
    
    if (index === 2) {
      // 3枚目完了時（チュートリアル完了後の最初のカード）
      const likedCount = results.filter(r => r.liked).length;
      if (likedCount >= 2) {
        message = 'いいね！素敵なセンスです✨';
      } else if (likedCount >= 1) {
        message = '好みが分かってきました👍';
      } else {
        message = 'もう少し見てみましょう🔍';
      }
    } else if (index === 3) {
      // 4枚目完了時（残り1枚）
      message = 'あと1枚で完了です！🎯';
    }

    if (message) {
      setProgressMessage(message);
      setShowProgressFeedback(true);
      setTimeout(() => setShowProgressFeedback(false), 2000);
    }
  }, []);

  // カードスタックの位置を更新
  const updateCardStack = useCallback(() => {
    if (!isInitialized) return;

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
  }, [cardAnimations, currentIndex, isInitialized]);

  // currentIndex変更時にカードスタックを更新
  useEffect(() => {
    updateCardStack();
  }, [currentIndex, updateCardStack]);

  // スワイプ完了処理を改善
  const handleSwipeComplete = useCallback(async (direction: 'left' | 'right') => {
    if (!selectedProducts[currentIndex]) {
      console.error('[UnifiedSwipe] No product at index:', currentIndex);
      return;
    }

    const currentProduct = selectedProducts[currentIndex];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 結果を記録
    const result: StyleQuizResult = {
      productId: currentProduct.id,
      liked: direction === 'right',
      category: currentProduct.category || undefined,
      tags: currentProduct.tags || undefined,
      isTutorial: currentIndex < 2,
    };

    const newResults = [...swipeResults, result];
    setSwipeResults(newResults);

    console.log('[UnifiedSwipe] Swipe recorded:', {
      index: currentIndex,
      direction,
      productId: currentProduct.id,
      totalResults: newResults.length
    });

    // チュートリアルオーバーレイを非表示（2枚目完了時）
    if (currentIndex === 1) {
      setShowTutorialOverlay(false);
    }

    // 中間フィードバック
    showIntermediateFeedback(currentIndex, newResults);

    // 次のカードへ、または完了処理
    if (currentIndex < TOTAL_CARDS - 1 && currentIndex < selectedProducts.length - 1) {
      // 次のカードへ進む
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsProcessing(false);
      }, 100);
    } else {
      // 完了処理（すべてのカードをスワイプした）
      console.log('[UnifiedSwipe] All cards swiped, completing onboarding');
      
      try {
        // 完了フィードバックを表示
        setProgressMessage('完了しました！🎉');
        setShowProgressFeedback(true);
        
        // 振動フィードバック（成功）
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // データを保存（根本的な修正：両方の関数を呼ぶ）
        try {
          // まずstateを更新
          await setStyleQuizResults(newResults);
          console.log('[UnifiedSwipe] Style quiz results set in state');
          
          // 次にDBに保存
          await saveUserProfile();
          console.log('[UnifiedSwipe] User profile and quiz results saved to DB');
        } catch (saveError) {
          console.error('[UnifiedSwipe] Failed to save data:', saveError);
          // 保存エラーがあっても次へ進む
        }
        
        // 少し待ってから遷移（ユーザーが完了を認識できるように）
        setTimeout(() => {
          console.log('[UnifiedSwipe] Navigating to StyleReveal');
          nextStep();
          navigation.navigate('StyleReveal');
        }, 1000);
      } catch (error) {
        console.error('[UnifiedSwipe] Failed to complete onboarding:', error);
        // エラー時のフォールバック - それでも次の画面へ遷移を試みる
        setProgressMessage('次へ進みます...');
        setShowProgressFeedback(true);
        setTimeout(() => {
          nextStep();
          navigation.navigate('StyleReveal');
        }, 1500);
      }
    }
  }, [currentIndex, selectedProducts, swipeResults, showIntermediateFeedback, setStyleQuizResults, saveUserProfile, nextStep, navigation]);

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

  // カードのアニメーションスタイルを事前に定義
  const cardAnimatedStyles = cardAnimations.map(anim => 
    useAnimatedStyle(() => ({
      transform: [
        { translateX: anim.translateX.value },
        { translateY: anim.translateY.value },
        { rotate: `${anim.rotate.value}deg` },
        { scale: anim.scale.value },
      ],
      opacity: anim.opacity.value,
    }))
  );

  const likeIndicatorStyles = cardAnimations.map((anim, index) =>
    useAnimatedStyle(() => {
      const isCurrentCard = index === currentIndexShared.value;
      const opacity = isCurrentCard
        ? interpolate(
            anim.translateX.value,
            [0, SCREEN_WIDTH * 0.25],
            [0, 1],
            Extrapolate.CLAMP
          )
        : 0;
      return { opacity };
    })
  );

  const nopeIndicatorStyles = cardAnimations.map((anim, index) =>
    useAnimatedStyle(() => {
      const isCurrentCard = index === currentIndexShared.value;
      const opacity = isCurrentCard
        ? interpolate(
            anim.translateX.value,
            [-SCREEN_WIDTH * 0.25, 0],
            [1, 0],
            Extrapolate.CLAMP
          )
        : 0;
      return { opacity };
    })
  );

  // カード描画コンポーネント
  const renderCard = useCallback((index: number) => {
    if (!selectedProducts[index] || !cardAnimations[index]) return null;

    const product = selectedProducts[index];
    const anim = cardAnimations[index];
    const isCurrentCard = index === currentIndex;
    const animatedStyle = cardAnimatedStyles[index];
    const likeStyle = likeIndicatorStyles[index];
    const nopeStyle = nopeIndicatorStyles[index];

    // ジェスチャーハンドラー
    const onGestureEvent = (event: any) => {
      if (!isCurrentCard || isProcessing) return;

      anim.translateX.value = event.nativeEvent.translationX;
      anim.translateY.value = event.nativeEvent.translationY * 0.5;
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

        // スワイプ判定
        if (
          Math.abs(translationX) > SWIPE_THRESHOLD ||
          Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD
        ) {
          setIsProcessing(true);
          const direction = translationX > 0 ? 'right' : 'left';
          const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
          const targetRotate = direction === 'right' ? 30 : -30;

          // カードを画面外へ
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
          // 元の位置に戻る
          anim.translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 100,
          });
          anim.translateY.value = withSpring((index - currentIndex) * CARD_STACK_OFFSET, {
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
        key={`card-${index}-${product.id}`}
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
  }, [selectedProducts, cardAnimations, currentIndex, isProcessing, handleSwipeComplete, cardAnimatedStyles, likeIndicatorStyles, nopeIndicatorStyles]);

  const handleBack = () => {
    prevStep();
    navigation.goBack();
  };

  if (productsLoading || !isInitialized) {
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
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={[styles.errorButtonText, { color: theme.colors.primary }]}>
              戻る
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const actualTotalCards = Math.min(TOTAL_CARDS, selectedProducts.length);

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
                  width: `${((currentIndex + 1) / actualTotalCards) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
            {currentIndex + 1} / {actualTotalCards}
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
          }).reverse()}
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
    marginBottom: 20,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
