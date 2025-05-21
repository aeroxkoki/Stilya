import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Platform, ActivityIndicator, View as RNView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View as AnimatedView } from 'react-native-reanimated';
const Animated = { View: AnimatedView };
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { Tags } from '@/components/common';
import { handleImageLoadError } from '@/utils/imageUtils';
import { useNetwork } from '@/contexts/NetworkContext';
import { View, Text, TouchableOpacity } from '../common/StyledComponents';
import { ExpoImage } from '../common/CachedImage';

export interface SwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
  onCardPress?: () => void; // テストとの互換性のため追加
  yesIndicatorStyle?: object;
  noIndicatorStyle?: object;
  testID?: string;
  screenshotMode?: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  product, 
  onPress,
  onCardPress, // onCardPress を追加
  onSwipeLeft,
  onSwipeRight,
  yesIndicatorStyle,
  noIndicatorStyle,
  testID,
  screenshotMode = false
}) => {
  const { isConnected } = useNetwork();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // スクリーンショットモードでは操作ボタンを無効化
  const swipeLeftAction = screenshotMode ? undefined : onSwipeLeft;
  const swipeRightAction = screenshotMode ? undefined : onSwipeRight;
  
  // オフラインモードでも操作ボタンを無効化
  const canSwipeLeft = isConnected !== false && swipeLeftAction;
  const canSwipeRight = isConnected !== false && swipeRightAction;

  // 商品画像がない場合にフォールバック画像を表示
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/350x500?text=No+Image';
  
  // APIエラー時のリトライ
  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
  };
  
  // コンポーネントがマウントされたときにロード状態をリセット
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
  }, [product.id]);
  
  return (
    <View style={styles.card} className="overflow-hidden w-full h-full" testID={testID || 'swipe-card'}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={!loadError ? (onPress || onCardPress) : handleRetry}
          className="bg-white rounded-xl shadow-lg overflow-hidden w-full h-full"
          testID={testID ? `${testID}-touch` : 'swipe-card-touch'}
          disabled={screenshotMode}
        >
          <View className="w-full h-full">
            {isLoading && (
              <View className="absolute z-10 w-full h-full items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-2 text-gray-600">読み込み中...</Text>
              </View>
            )}
            
            {loadError && (
              <View className="absolute z-10 w-full h-full items-center justify-center bg-gray-100">
                <Ionicons name="alert-circle-outline" size={48} color="#F87171" />
                <Text className="mt-2 text-gray-700 text-center">
                  画像の読み込みに失敗しました
                </Text>
                <TouchableOpacity 
                  onPress={handleRetry}
                  className="mt-4 py-2 px-4 bg-blue-500 rounded-lg"
                >
                  <Text className="text-white font-bold">再読み込み</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <ExpoImage
              source={{ uri: imageUrl }}
              style={styles.image}
              className="w-full h-full"
              contentFit="cover"
              transition={300}
              testID="product-image"
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setLoadError(true);
                handleImageLoadError(imageUrl);
              }}
              cachePolicy={isConnected === false ? 'memory-disk' : 'disk'}
            />
            
            {/* Yes/Noインジケーター */}
            {!loadError && (
              <>
                <Animated.View 
                  style={[styles.indicator, styles.yesIndicator, yesIndicatorStyle]}
                  testID="yes-indicator"
                >
                  <Text style={styles.indicatorText}>YES</Text>
                </Animated.View>
                
                <Animated.View 
                  style={[styles.indicator, styles.noIndicator, noIndicatorStyle]}
                  testID="no-indicator"
                >
                  <Text style={styles.indicatorText}>NO</Text>
                </Animated.View>
              </>
            )}
            
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4" testID="product-info">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold text-xl" numberOfLines={1}>
                    {product.title}
                  </Text>
                  {product.brand && (
                    <Text className="text-gray-200 text-base" numberOfLines={1}>
                      {product.brand}
                    </Text>
                  )}
                </View>
                <Text className="text-white font-bold text-xl ml-2">
                  {formatPrice(product.price)}
                </Text>
              </View>
              
              {product.tags && product.tags.length > 0 && (
                <View className="mt-2">
                  <Tags tags={product.tags} size="small" />
                </View>
              )}
            </View>
            
            {/* スワイプアクションボタン - スクリーンショットモードかオフラインでは非表示/無効化 */}
            {!loadError && !screenshotMode && (
              <View className="absolute bottom-28 left-4 right-4 flex-row justify-between">
                <TouchableOpacity 
                  className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                  onPress={canSwipeLeft ? swipeLeftAction : undefined}
                  testID="swipe-left-button"
                  disabled={!canSwipeLeft}
                  style={!canSwipeLeft ? { opacity: 0.5 } : {}}
                  accessibilityLabel="いいえ"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSwipeLeft }}
                >
                  <Ionicons name="close" size={32} color="#F87171" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                  onPress={canSwipeRight ? swipeRightAction : undefined}
                  testID="swipe-right-button"
                  disabled={!canSwipeRight}
                  style={!canSwipeRight ? { opacity: 0.5 } : {}}
                  accessibilityLabel="はい"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSwipeRight }}
                >
                  <Ionicons name="heart" size={32} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  indicator: {
    position: 'absolute',
    padding: 10,
    borderWidth: 5,
    borderRadius: 12,
    top: 30,
    transform: [{ rotate: '-20deg' }],
    zIndex: 10,
  },
  yesIndicator: {
    right: 20,
    borderColor: '#22C55E',
  },
  noIndicator: {
    left: 20,
    borderColor: '#F87171',
  },
  indicatorText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});

export default React.memo(SwipeCard, (prevProps, nextProps) => {
  // 重要な props が変わらない場合は再レンダリングしない
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.screenshotMode === nextProps.screenshotMode
  );
});
