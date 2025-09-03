import React, { useState, useEffect, useRef } from 'react';
import { StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator, Text, Image as RNImage } from 'react-native';
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
  silentFallback?: boolean; // サイレントフォールバックモード
  preload?: boolean; // プリロード機能
  [key: string]: any;
}

/**
 * 改善された画像表示コンポーネント
 * expo-imageを使用して高性能な画像表示を実現
 * エラーハンドリングをサイレントにしてUXを改善
 */
const CachedImage: React.FC<CachedImageProps> = ({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  showLoadingIndicator = false,
  debugMode = false,
  productTitle,
  silentFallback = true, // デフォルトでサイレントモード
  preload = false,
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [useNativeImage, setUseNativeImage] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const errorCount = useRef(0);
  
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
    // 常にデバッグログを出力（開発環境）
    if (__DEV__) {
      console.log('[CachedImage] 📸 Image URL optimization:', {
        product: productTitle || 'unknown',
        original: source.uri?.substring(0, 100),
        optimized: optimizedUrl?.substring(0, 100),
        changed: source.uri !== optimizedUrl,
        hasHttps: optimizedUrl?.startsWith('https://'),
        isRakuten: optimizedUrl?.includes('rakuten'),
        hasSize: optimizedUrl?.includes('_ex='),
      });
    }
    return { uri: optimizedUrl };
  }, [source, productTitle, debugMode]);
  
  // フォールバック画像（よりシンプルで高速な画像）
  const fallbackSource = React.useMemo(() => {
    // エレガントなグレーの背景画像（ファッションアプリに適したデザイン）
    return { uri: 'https://via.placeholder.com/800x800/f5f5f5/cccccc?text=No+Image' };
  }, []);
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // エラー処理（サイレントモード対応）
  const handleError = (event: any) => {
    errorCount.current += 1;
    
    // 常にエラーログを出力（開発環境）
    if (__DEV__) {
      console.warn('[CachedImage] ❌ Failed to load image:', {
        product: productTitle || 'unknown',
        url: typeof imageSource === 'object' && 'uri' in imageSource ? imageSource.uri : 'unknown',
        error: event?.error || event?.nativeEvent?.error || 'Unknown error',
        errorMessage: event?.nativeEvent?.message || event?.message,
        errorCount: errorCount.current,
        willUseNativeImage: errorCount.current === 1 && !useNativeImage
      });
    }
    
    setIsLoading(false);
    setHasError(true);
    
    // 最初のエラーの場合、React Native標準のImageを試す
    if (errorCount.current === 1 && !useNativeImage) {
      console.log('[CachedImage] Switching to React Native Image for:', productTitle);
      setUseNativeImage(true);
      setHasError(false);
      setIsLoading(true);
    } else {
      // それでもダメな場合はフォールバック画像に切り替え
      // エラー表示を出さずにスムーズに切り替える
      setUseFallback(true);
    }
  };
  
  
  // サイレントなフォールバック表示
  const SilentFallback = () => (
    <View style={[StyleSheet.absoluteFillObject, styles.silentFallbackContainer]}>
      <Ionicons name="image-outline" size={32} color="#ddd" />
    </View>
  );
  
  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoadingIndicator && !silentFallback && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      
      {/* React Native標準のImageを使用（フォールバック） */}
      {useNativeImage ? (
        <RNImage
          source={useFallback ? fallbackSource : imageSource}
          style={StyleSheet.absoluteFillObject}
          resizeMode={resizeMode || 'cover'}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
            if (__DEV__) {
              console.log(`[CachedImage] ✅ Loaded with RN Image:`, productTitle);
            }
          }}
          onError={handleError}
          {...restProps}
        />
      ) : (
        <Image
          source={useFallback ? fallbackSource : imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit={finalContentFit}
          cachePolicy="memory-disk"
          priority={preload ? "low" : "high"} // プリロードは低優先度
          transition={50} // トランジション時間を短縮して切り替えを高速化
          placeholder={fallbackSource}
          placeholderContentFit="cover"
          recyclingKey={productTitle} // キャッシュキーを追加
          allowDownscaling={true} // ダウンスケーリングを許可
          autoplay={false} // アニメーションGIFの自動再生を無効化
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
            setUseFallback(false);
          }}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
            if (__DEV__ && useFallback) {
              console.log(`[CachedImage] ✅ Loaded fallback for:`, productTitle);
            } else if (__DEV__) {
              console.log(`[CachedImage] ✅ Successfully loaded image for:`, productTitle);
            }
          }}
          onError={handleError}
          {...restProps}
        />
      )}
      
      {/* サイレントモードでフォールバック表示中 */}
      {silentFallback && useFallback && (
        <SilentFallback />
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
  silentFallbackContainer: {
    backgroundColor: '#f0f0f0',
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
