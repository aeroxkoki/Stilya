import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { Tags } from '@/components/common';

export interface SwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
  yesIndicatorStyle?: object;
  noIndicatorStyle?: object;
  testID?: string;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  product, 
  onPress,
  onSwipeLeft,
  onSwipeRight,
  yesIndicatorStyle,
  noIndicatorStyle,
  testID
}) => {
  return (
    <View style={styles.card} className="overflow-hidden w-full h-full" testID={testID || 'swipe-card'}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          className="bg-white rounded-xl shadow-lg overflow-hidden w-full h-full"
          testID={testID ? `${testID}-touch` : 'swipe-card-touch'}
        >
          <View className="w-full h-full">
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              className="w-full h-full"
            />
            
            {/* Yes/Noインジケーター */}
            <Animated.View 
              style={[styles.indicator, styles.yesIndicator, yesIndicatorStyle]}
            >
              <Text style={styles.indicatorText}>YES</Text>
            </Animated.View>
            
            <Animated.View 
              style={[styles.indicator, styles.noIndicator, noIndicatorStyle]}
            >
              <Text style={styles.indicatorText}>NO</Text>
            </Animated.View>
            
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
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
            
            {/* スワイプアクションボタン */}
            <View className="absolute bottom-28 left-4 right-4 flex-row justify-between">
              <TouchableOpacity 
                className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                onPress={onSwipeLeft}
                testID="swipe-left-button"
                disabled={!onSwipeLeft}
                style={!onSwipeLeft ? { opacity: 0.5 } : {}}
              >
                <Ionicons name="close" size={32} color="#F87171" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                onPress={onSwipeRight}
                testID="swipe-right-button"
                disabled={!onSwipeRight}
                style={!onSwipeRight ? { opacity: 0.5 } : {}}
              >
                <Ionicons name="heart" size={32} color="#3B82F6" />
              </TouchableOpacity>
            </View>
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

export default SwipeCard;