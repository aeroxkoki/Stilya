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
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'contain' : resizeMode) : 
    contentFit;
  
  // 高画質モードが有効な場合、URLを最適化
  let finalSource = source;
  
  if (highQuality && typeof source === 'object' && source.uri) {
    const originalUrl = source.uri;
    
    // すでに最適化済みかチェック（楽天のサムネイルURLでない場合はスキップ）
    const needsOptimization = originalUrl.includes('thumbnail.image.rakuten.co.jp') || 
                             originalUrl.includes('128x128') || 
                             originalUrl.includes('64x64') ||
                             originalUrl.includes('_ex=128x128') ||
                             originalUrl.includes('_ex=64x64');
    
    if (needsOptimization) {
      const optimizedUrl = optimizeImageUrl(originalUrl);
      
      if (__DEV__) {
        console.log('[CachedImage] Image URL optimized:', {
          original: originalUrl,
          optimized: optimizedUrl
        });
      }
      
      finalSource = { 
        uri: optimizedUrl 
      };
    } else {
      // すでに最適化済みの場合はデバッグログをスキップ
      finalSource = source;
    }
  }
  
  // エラー時のハンドラ
  const handleError = (error?: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // エラー詳細を収集
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.code || 'No code';
    const uri = typeof finalSource === 'object' && finalSource.uri ? finalSource.uri : 'Unknown';
    
    setErrorDetails(`${errorMessage} (Code: ${errorCode})`);
    
    if (__DEV__) {
      console.error('[CachedImage] Failed to load image:', {
        uri: uri,
        originalUri: typeof source === 'object' && source.uri ? source.uri : 'Unknown',
        error: error,
        errorMessage: errorMessage,
        errorCode: errorCode,
        errorStack: error?.stack
      });
      
      // ネットワークエラーの可能性を確認
      if (errorMessage.includes('network') || errorMessage.includes('Network') || 
          errorMessage.includes('Failed to fetch') || errorMessage.includes('timeout')) {
        console.error('[CachedImage] Network error detected. Check NSAppTransportSecurity settings.');
      }
    }
    
    // onError プロパティが渡されていれば呼び出す
    if (restProps.onError) {
      restProps.onError(error);
    }
  };
  
  // エラー状態の場合のフォールバック表示
  if (hasError) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorText}>画像を読み込めません</Text>
        {__DEV__ && (
          <>
            <Text style={styles.errorDetails} numberOfLines={2}>{errorDetails}</Text>
            {typeof source === 'object' && source.uri && (
              <Text style={styles.errorUrl} numberOfLines={2}>{source.uri}</Text>
            )}
          </>
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
        onLoadStart={() => {
          setIsLoading(true);
          if (__DEV__) {
            console.log('[CachedImage] Loading started:', {
              uri: typeof finalSource === 'object' && finalSource.uri ? finalSource.uri : 'Local resource'
            });
          }
        }}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
          
          if (__DEV__) {
            console.log('[CachedImage] Successfully loaded:', {
              uri: typeof finalSource === 'object' && finalSource.uri ? finalSource.uri : 'Local resource'
            });
          }
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
  errorDetails: {
    color: '#e74c3c',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: 'bold',
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
    
    if (__DEV__) {
      console.log('[CachedImage] Prefetched:', optimizedUrl);
    }
  } catch (error) {
    console.warn('[CachedImage] Prefetch failed:', url, error);
  }
};

export default CachedImage;
export const ExpoImage = CachedImage; // 互換性のためのエイリアス
