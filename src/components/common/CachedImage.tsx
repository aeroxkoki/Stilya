import React, { useState } from 'react';
import { StyleProp, ImageStyle, ViewStyle, ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/supabaseOptimization';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  className?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  contentPosition?: string;
  placeholder?: object;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
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
  const [hasError, setHasError] = useState(false);
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'contain' : resizeMode) : 
    contentFit;
  
  // 高画質モードが有効な場合、URLを最適化
  let finalSource = source;
  
  if (highQuality && typeof source === 'object' && source.uri) {
    // デバッグ: 元のURLと最適化後のURLをログ出力
    const originalUrl = source.uri;
    const optimizedUrl = optimizeImageUrl(source.uri);
    
    if (__DEV__) {
      console.log('[CachedImage] Image URL Debug:', {
        original: originalUrl,
        optimized: optimizedUrl,
        changed: originalUrl !== optimizedUrl
      });
    }
    
    finalSource = { 
      uri: optimizedUrl 
    };
  }
  
  // エラー時のハンドラ
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (__DEV__ && typeof source === 'object' && source.uri) {
      console.error('[CachedImage] Failed to load image:', source.uri);
    }
  };
  
  // エラー状態の場合のフォールバック表示
  if (hasError) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorText}>画像を読み込めません</Text>
        {__DEV__ && typeof source === 'object' && source.uri && (
          <Text style={styles.errorUrl} numberOfLines={2}>{source.uri}</Text>
        )}
      </View>
    );
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
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={handleError}
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
  errorContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  errorText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  errorUrl: {
    color: '#999',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
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
