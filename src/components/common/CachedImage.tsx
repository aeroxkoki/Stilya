import React, { useState } from 'react';
import { StyleProp, ImageStyle, ViewStyle, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle | ViewStyle>;
  className?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  contentPosition?: string;
  placeholder?: object;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoadingIndicator?: boolean;
  highQuality?: boolean;
  [key: string]: any;
}

// expo-imageの高性能画像コンポーネント
const CachedImage: React.FC<CachedImageProps> = ({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  transition = 200,
  showLoadingIndicator = false,
  highQuality = true,
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode) : 
    contentFit;
  
  // 高画質モードが有効な場合、URLを最適化
  let finalSource = source;
  
  if (highQuality && typeof source === 'object' && source.uri) {
    finalSource = { 
      uri: optimizeImageUrl(source.uri) 
    };
  }
  
  return (
    <View style={[styles.container, isLoading && showLoadingIndicator ? styles.centerContent : null]}>
      {isLoading && showLoadingIndicator && (
        <ActivityIndicator size="small" color="#3498db" style={styles.loader} />
      )}
      
      <Image
        source={finalSource}
        style={style}
        contentFit={finalContentFit}
        transition={transition}
        cachePolicy="memory-disk" // メモリとディスクの両方にキャッシュ
        priority="high" // 優先度を高に設定
        recyclingKey={typeof finalSource === 'object' ? finalSource.uri : undefined} // キャッシュ制御用
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
  },
});

// 画像の事前読み込み機能
export const prefetchImage = async (url: string) => {
  try {
    // 高画質URLに最適化してからプリフェッチ
    const optimizedUrl = optimizeImageUrl(url);
    await Image.prefetch(optimizedUrl);
  } catch (error) {
    console.warn('画像のプリフェッチに失敗:', error);
  }
};

export default CachedImage;
export const ExpoImage = CachedImage; // 互換性のためのエイリアス
