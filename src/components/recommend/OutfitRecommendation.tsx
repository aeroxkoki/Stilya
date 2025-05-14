import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ViewStyle } from 'react-native';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface OutfitRecommendationProps {
  outfit: {
    top: Product | null;
    bottom: Product | null;
    outerwear?: Product | null;
    accessories?: Product | null;
  };
  onPress: () => void;
  layout?: 'card' | 'full'; // カード表示かフル表示か
  style?: ViewStyle;
}

const OutfitRecommendation: React.FC<OutfitRecommendationProps> = ({
  outfit,
  onPress,
  layout = 'card',
  style,
}) => {
  const { top, bottom, outerwear, accessories } = outfit;
  
  // コーディネートが無効な場合は表示しない
  if (!top && !bottom) {
    return null;
  }
  
  // アイテムのURL取得ヘルパー
  const getImage = (product: Product | null | undefined): string => {
    if (!product) return '';
    // ここでimageUrlかimage_urlの区別をしておく
    return product.imageUrl || product.image_url || '';
  };
  
  // コーディネートの合計金額を計算
  const getTotalPrice = (): number => {
    let total = 0;
    if (top) total += top.price;
    if (bottom) total += bottom.price;
    if (outerwear) total += outerwear.price;
    if (accessories) total += accessories.price;
    return total;
  };
  
  // コーディネートの説明文を生成
  const getOutfitDescription = (): string => {
    const items: string[] = [];
    if (top) items.push(top.brand || 'ブランド');
    if (bottom) items.push(bottom.brand || 'ブランド');
    
    return `${items.join(' × ')} コーディネート`;
  };
  
  // コーディネートのアイテム数を取得
  const getItemCount = (): number => {
    let count = 0;
    if (top) count++;
    if (bottom) count++;
    if (outerwear) count++;
    if (accessories) count++;
    return count;
  };
  
  // カードレイアウト用のレンダリング
  if (layout === 'card') {
    return (
      <TouchableOpacity 
        style={[styles.cardContainer, style]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardImages}>
          {/* メインアイテム */}
          <View style={styles.mainImageContainer}>
            <Image 
              source={{ uri: getImage(top) || getImage(bottom) }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </View>
          
          {/* サブアイテム */}
          <View style={styles.subImagesContainer}>
            {bottom && top && (
              <Image 
                source={{ uri: getImage(bottom) }}
                style={styles.subImage}
                resizeMode="cover"
              />
            )}
            
            {outerwear && (
              <Image 
                source={{ uri: getImage(outerwear) }}
                style={styles.subImage}
                resizeMode="cover"
              />
            )}
            
            {accessories && (
              <Image 
                source={{ uri: getImage(accessories) }}
                style={styles.subImage}
                resizeMode="cover"
              />
            )}
            
            {/* アイテムが3つ未満の場合、空のプレースホルダーで埋める */}
            {getItemCount() < 3 && (
              <View style={[styles.subImage, styles.placeholderItem]}>
                <Ionicons name="add-outline" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.outfitTitle}>コーディネート</Text>
          <Text style={styles.outfitItemsCount}>{getItemCount()}点のアイテム</Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  // フルレイアウト用のレンダリング
  return (
    <TouchableOpacity 
      style={[styles.fullContainer, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fullImages}>
        {/* 左側にメインアイテム */}
        <View style={styles.fullMainImageContainer}>
          <Image 
            source={{ uri: getImage(top) || getImage(bottom) }}
            style={styles.fullMainImage}
            resizeMode="cover"
          />
        </View>
        
        {/* 右側にその他アイテム */}
        <View style={styles.fullSubImagesContainer}>
          {bottom && top && (
            <Image 
              source={{ uri: getImage(bottom) }}
              style={styles.fullSubImage}
              resizeMode="cover"
            />
          )}
          
          {outerwear && (
            <Image 
              source={{ uri: getImage(outerwear) }}
              style={styles.fullSubImage}
              resizeMode="cover"
            />
          )}
          
          {accessories && (
            <Image 
              source={{ uri: getImage(accessories) }}
              style={styles.fullSubImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>
      
      <View style={styles.fullInfo}>
        <View>
          <Text style={styles.fullOutfitTitle}>コーディネート</Text>
          <Text style={styles.fullOutfitDescription}>
            {getOutfitDescription()}
          </Text>
        </View>
        
        <View style={styles.fullPriceContainer}>
          <Text style={styles.fullPriceLabel}>合計</Text>
          <Text style={styles.fullPrice}>¥{getTotalPrice().toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // カードレイアウトのスタイル
  cardContainer: {
    width: 240,
    height: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 16,
  },
  cardImages: {
    height: 220,
    flexDirection: 'row',
  },
  mainImageContainer: {
    flex: 2,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  subImagesContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  subImage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  placeholderItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    padding: 12,
  },
  outfitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  outfitItemsCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  
  // フルレイアウトのスタイル
  fullContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullImages: {
    height: 200,
    flexDirection: 'row',
  },
  fullMainImageContainer: {
    flex: 2,
  },
  fullMainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  fullSubImagesContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  fullSubImage: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fullInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullOutfitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  fullOutfitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  fullPriceContainer: {
    alignItems: 'flex-end',
  },
  fullPriceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  fullPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
});

export default OutfitRecommendation;
