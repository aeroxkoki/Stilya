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
  optimizeUrl?: boolean; // URL最適化を有効にするか（デフォルト: false）
  showErrorFallback?: boolean; // エラー時にフォールバック画像を表示するか
  [key: string]: any;
}

// デフォルトのフォールバック画像
const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/f0f0f0/666666?text=No+Image';

// expo-imageの高性能画像コンポーネント
const CachedImage: React.FC<CachedImageProps> = ({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  transition = 200,
  showLoadingIndicator = false,
  optimizeUrl = true, // デフォルトで有効化に変更
  showErrorFallback = true,
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSource, setCurrentSource] = useState(source);
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'contain' : resizeMode) : 
    contentFit;
  
  // sourceが変更されたらリセット
  React.useEffect(() => {
    setHasError(false);
    setCurrentSource(source);
    setIsLoading(true);
  }, [source]);
  
  // URL最適化
  React.useEffect(() => {
    if (optimizeUrl && typeof source === 'object' && source.uri) {
      const originalUrl = source.uri;
      
      // すでに最適化済みかチェック
      const needsOptimization = originalUrl.includes('thumbnail.image.rakuten.co.jp') || 
                               originalUrl.includes('128x128') || 
                               originalUrl.includes('64x64') ||
                               originalUrl.includes('_ex=128x128') ||
                               originalUrl.includes('_ex=64x64');
      
      if (needsOptimization) {
        const optimizedUrl = optimizeImageUrl(originalUrl);
        
        if (__DEV__) {
          console.log('[CachedImage] URL最適化:', {
            original: originalUrl,
            optimized: optimizedUrl
          });
        }
        
        setCurrentSource({ uri: optimizedUrl });
      }
    }
  }, [source, optimizeUrl]);
  
  // エラー時のハンドラ
  const handleError = (error?: any) => {
    setIsLoading(false);
    
    if (__DEV__) {
      console.warn('[CachedImage] 画像読み込みエラー:', {
        uri: typeof currentSource === 'object' && currentSource.uri ? currentSource.uri : 'Unknown',
        error: error?.message || 'Unknown error',
        optimizeUrl
      });
    }
    
    // 一時的なエラーの可能性があるため、すぐにフォールバックに切り替えない
    // ネットワークエラーやタイムアウトの場合は1回だけリトライ
    if (!hasError) {
      setTimeout(() => {
        setHasError(false);
        setIsLoading(true);
        // 同じURLで再度試す
        setCurrentSource({...currentSource});
      }, 2000); // 2秒後にリトライ
    } else {
      // 2回目のエラーの場合はフォールバックを表示
      setHasError(true);
    }
    
    // onError プロパティが渡されていれば呼び出す
    if (restProps.onError) {
      restProps.onError(error);
    }
  };
  
  // エラー時にフォールバック画像を使用
  const imageSource = hasError && showErrorFallback 
    ? { uri: FALLBACK_IMAGE }
    : currentSource;
  
  return (
    <View style={[styles.container, isLoading && showLoadingIndicator ? styles.centerContent : null]}>
      {isLoading && showLoadingIndicator && (
        <ActivityIndicator size="small" color="#3498db" style={styles.loader} />
      )}
      
      <Image
        source={imageSource}
        style={style}
        contentFit={finalContentFit}
        transition={transition}
        cachePolicy="memory-disk" // メモリとディスクの両方にキャッシュ
        priority="high" // 優先度を高に設定
        allowDownscaling={true} // ダウンスケーリングを許可
        recyclingKey={typeof imageSource === 'object' ? imageSource.uri : undefined} // キャッシュ制御用
        onLoadStart={() => {
          setIsLoading(true);
        }}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={handleError}
        {...restProps}
      />
      
      {/* エラー時のオーバーレイ（開発環境のみ） */}
      {__DEV__ && hasError && !showErrorFallback && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>!</Text>
        </View>
      )}
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
  errorOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

// 画像の事前読み込み機能
export const prefetchImage = async (url: string, optimize: boolean = false) => {
  try {
    // URL最適化（オプショナル）
    const finalUrl = optimize ? optimizeImageUrl(url) : url;
    await Image.prefetch(finalUrl);
    
    if (__DEV__) {
      console.log('[CachedImage] Prefetched:', finalUrl);
    }
  } catch (error) {
    console.warn('[CachedImage] Prefetch failed:', url, error);
  }
};

export default CachedImage;
export const ExpoImage = CachedImage; // 互換性のためのエイリアス
