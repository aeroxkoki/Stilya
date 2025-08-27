import React, { useState, useEffect } from 'react';
import { StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoadingIndicator?: boolean;
  debugMode?: boolean; // デバッグモードを追加
  productTitle?: string; // 商品名（デバッグ用）
  [key: string]: any;
}

/**
 * シンプルな画像表示コンポーネント
 * expo-imageを使用して高性能な画像表示を実現
 */
const CachedImage: React.FC<CachedImageProps> = ({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  showLoadingIndicator = false,
  debugMode = false,
  productTitle,
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'contain' : resizeMode) : 
    contentFit;
  
  // 画像URLを最適化
  const imageSource = React.useMemo(() => {
    if (typeof source === 'number') {
      return source; // ローカル画像の場合はそのまま返す
    }
    
    const optimizedUrl = optimizeImageUrl(source.uri);
    // デバッグログ（開発環境のみ）
    if (__DEV__) {
      console.log('[CachedImage] Image URL optimization:', {
        product: productTitle || 'unknown',
        original: source.uri?.substring(0, 100),
        optimized: optimizedUrl?.substring(0, 100),
        changed: source.uri !== optimizedUrl
      });
    }
    return { uri: optimizedUrl };
  }, [source, productTitle]);
  
  // エラー時のフォールバック画像（複数のフォールバックを用意）
  const fallbackSources = [
    { uri: 'https://picsum.photos/800/800?grayscale' },
    { uri: 'https://via.placeholder.com/800x800/f0f0f0/666666?text=No+Image' },
  ];
  
  const getFallbackSource = () => {
    return fallbackSources[retryCount % fallbackSources.length];
  };
  
  // エラー処理とリトライロジック
  const handleError = (event: any) => {
    console.warn('[CachedImage] Failed to load image:', {
      product: productTitle || 'unknown',
      url: typeof imageSource === 'object' && 'uri' in imageSource ? imageSource.uri : 'unknown',
      error: event?.error,
      retryCount,
    });
    
    setIsLoading(false);
    setHasError(true);
    setErrorDetails(event?.error);
    
    // 3回までリトライ
    if (retryCount < 3) {
      setTimeout(() => {
        console.log(`[CachedImage] Retrying... (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
      }, 1000 * (retryCount + 1)); // リトライ間隔を徐々に増やす
    }
  };
  
  // デバッグモードで詳細情報を表示
  useEffect(() => {
    if (debugMode && hasError && errorDetails) {
      console.log('[CachedImage] Detailed error info:', {
        product: productTitle,
        url: typeof imageSource === 'object' && 'uri' in imageSource ? imageSource.uri : 'unknown',
        errorDetails: JSON.stringify(errorDetails, null, 2),
        retryCount,
      });
    }
  }, [hasError, errorDetails, debugMode, productTitle, imageSource, retryCount]);
  
  // エラー表示コンポーネント
  const ErrorDisplay = () => (
    <View style={[StyleSheet.absoluteFillObject, styles.errorContainer]}>
      <Ionicons name="image-outline" size={48} color="#999" />
      <Text style={styles.errorText}>画像を読み込めませんでした</Text>
      {debugMode && (
        <>
          <Text style={styles.debugText}>{productTitle || 'Unknown product'}</Text>
          <Text style={styles.debugText}>Retry: {retryCount}/3</Text>
        </>
      )}
    </View>
  );
  
  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      
      {hasError && retryCount >= 3 ? (
        <ErrorDisplay />
      ) : (
        <Image
          source={hasError ? getFallbackSource() : imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit={finalContentFit}
          cachePolicy="memory-disk"
          priority="high" // 高優先度に変更
          transition={200} // スムーズなトランジション
          onLoadStart={() => {
            setIsLoading(true);
            if (retryCount === 0) {
              setHasError(false);
            }
          }}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
            if (__DEV__ && retryCount > 0) {
              console.log(`[CachedImage] Successfully loaded after ${retryCount} retries:`, productTitle);
            }
          }}
          onError={handleError}
          {...restProps}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  errorContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  debugText: {
    marginTop: 4,
    color: '#ccc',
    fontSize: 12,
  },
});

export default CachedImage;
