import React from 'react';
import { StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { Image } from 'expo-image';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle | ViewStyle>;
  className?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  contentPosition?: string;
  placeholder?: object;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  [key: string]: any;
}

// expo-imageの高性能画像コンポーネント
const CachedImage: React.FC<CachedImageProps> = ({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  transition = 200,
  ...restProps 
}) => {
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode) : 
    contentFit;
    
  return (
    <Image
      source={source}
      style={style}
      contentFit={finalContentFit}
      transition={transition}
      cachePolicy="memory-disk" // メモリとディスクの両方にキャッシュ
      priority="normal"
      {...restProps}
    />
  );
};

// 画像の事前読み込み機能
export const prefetchImage = async (url: string) => {
  try {
    await Image.prefetch(url);
  } catch (error) {
    console.warn('画像のプリフェッチに失敗:', error);
  }
};

export default CachedImage;
export const ExpoImage = CachedImage; // 互換性のためのエイリアス
