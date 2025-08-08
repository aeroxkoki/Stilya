import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwipeCard from '@/components/swipe/SwipeCard';
import { Product } from '@/types/product';
import { useStyle } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;

interface TutorialSwipeContainerProps {
  onComplete?: () => void;
}

// チュートリアル用のサンプル商品データ
const tutorialProducts: Product[] = [
  {
    id: 'tutorial-1',
    title: 'ベーシック Tシャツ',
    brand: 'Sample Brand',
    price: 2990,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: '着心地の良いベーシックなTシャツ',
    tags: ['casual', 'basic'],
    category: 'tops',
    affiliateUrl: null,
    gender: 'unisex',
    isUsed: false,
  },
  {
    id: 'tutorial-2',
    title: 'デニムジャケット',
    brand: 'Fashion Store',
    price: 7990,
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400',
    description: 'トレンドのオーバーサイズデニムジャケット',
    tags: ['casual', 'denim', 'outer'],
    category: 'outerwear',
    affiliateUrl: null,
    gender: 'unisex',
    isUsed: false,
  },
  {
    id: 'tutorial-3',
    title: 'ニットセーター',
    brand: 'Cozy Wear',
    price: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    description: '暖かくて柔らかいニットセーター',
    tags: ['casual', 'knit', 'warm'],
    category: 'tops',
    affiliateUrl: null,
    gender: 'unisex',
    isUsed: false,
  },
];

const TutorialSwipeContainer: React.FC<TutorialSwipeContainerProps> = ({ onComplete }) => {
  const { theme } = useStyle();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'like' | 'nope' | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<{ product: Product; action: 'like' | 'nope' }[]>([]);
  const position = useRef(new Animated.ValueXY()).current;
  const [isFirstSwipe, setIsFirstSwipe] = useState(true);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      tension: 30,
      friction: 5,
    }).start();
  }, [position]);

  const swipeCard = useCallback(
    (direction: 'left' | 'right') => {
      const x = direction === 'right' ? width : -width;
      
      // ハプティックフィードバック
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => {
        const action = direction === 'right' ? 'like' : 'nope';
        const currentProduct = tutorialProducts[currentIndex];
        
        // スワイプ履歴に追加
        setSwipeHistory(prev => [...prev, { product: currentProduct, action }]);
        
        // フィードバック表示
        setShowFeedback(action);
        setIsFirstSwipe(false);
        
        setTimeout(() => {
          setShowFeedback(null);
          position.setValue({ x: 0, y: 0 });
          
          if (currentIndex < tutorialProducts.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // チュートリアル完了
            if (onComplete) {
              onComplete();
            }
          }
        }, 500);
      });
    },
    [currentIndex, position, onComplete]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width / 2, 0, width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const getLikeOpacity = () => {
    return position.x.interpolate({
      inputRange: [0, width / 4],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  };

  const getNopeOpacity = () => {
    return position.x.interpolate({
      inputRange: [-width / 4, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  const currentProduct = tutorialProducts[currentIndex];

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          スワイプを練習してみましょう
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          気に入ったら右へ、スキップは左へスワイプ
        </Text>
      </View>

      {/* カードエリア */}
      <View style={styles.cardArea}>
        {currentProduct && (
          <Animated.View
            style={[styles.cardWrapper, getCardStyle()]}
            {...panResponder.panHandlers}
          >
            <SwipeCard
              product={currentProduct}
              testID="tutorial-swipe-card"
            />
            
            {/* LIKE インジケーター */}
            <Animated.View
              style={[
                styles.likeIndicator,
                { opacity: getLikeOpacity() }
              ]}
            >
              <Text style={styles.likeText}>LIKE</Text>
            </Animated.View>
            
            {/* NOPE インジケーター */}
            <Animated.View
              style={[
                styles.nopeIndicator,
                { opacity: getNopeOpacity() }
              ]}
            >
              <Text style={styles.nopeText}>SKIP</Text>
            </Animated.View>
          </Animated.View>
        )}

        {/* フィードバック表示 */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <View
              style={[
                styles.feedbackBubble,
                showFeedback === 'like' ? styles.likeFeedback : styles.nopeFeedback,
              ]}
            >
              <Ionicons
                name={showFeedback === 'like' ? 'heart' : 'close-circle'}
                size={32}
                color="white"
              />
              <Text style={styles.feedbackText}>
                {showFeedback === 'like' ? 'いいね！' : 'スキップ'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.nopeButton]}
          onPress={() => swipeCard('left')}
        >
          <Ionicons name="close" size={30} color="#EF4444" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swipeCard('right')}
        >
          <Ionicons name="heart" size={30} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* プログレスインジケーター */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / tutorialProducts.length) * 100}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
          {currentIndex + 1} / {tutorialProducts.length}
        </Text>
      </View>

      {/* ヒント表示（初回のみ） */}
      {isFirstSwipe && (
        <View style={styles.hintContainer}>
          <View style={[styles.hintBubble, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.hintText}>
              カードを左右にドラッグするか、下のボタンをタップしてください
            </Text>
          </View>
        </View>
      )}

      {/* スワイプ履歴（完了時） */}
      {currentIndex === tutorialProducts.length - 1 && swipeHistory.length > 0 && (
        <View style={styles.completionContainer}>
          <Text style={[styles.completionTitle, { color: theme.colors.text.primary }]}>
            練習完了！
          </Text>
          <Text style={[styles.completionSubtitle, { color: theme.colors.text.secondary }]}>
            あなたの選択:
          </Text>
          <View style={styles.historyContainer}>
            {swipeHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Ionicons
                  name={item.action === 'like' ? 'heart' : 'close-circle'}
                  size={20}
                  color={item.action === 'like' ? '#10B981' : '#EF4444'}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardWrapper: {
    position: 'absolute',
    width: width * 0.9,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#10B981',
    borderRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  likeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#EF4444',
    borderRadius: 8,
    transform: [{ rotate: '25deg' }],
  },
  nopeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  feedbackContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  feedbackBubble: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeFeedback: {
    backgroundColor: '#10B981',
  },
  nopeFeedback: {
    backgroundColor: '#EF4444',
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 60,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nopeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
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
  },
  hintContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintBubble: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: width * 0.8,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  completionContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  historyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  historyItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TutorialSwipeContainer;
