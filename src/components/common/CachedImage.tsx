import React, { useState, useEffect, memo } from 'react';
import { StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoadingIndicator?: boolean;
  debugMode?: boolean;
  productTitle?: string;
  silentFallback?: boolean;
  preload?: boolean;
  [key: string]: any;
}

/**
 * シンプル化された画像表示コンポーネント
 * - 初めからexpo-imageを使用（React Native Imageへのフォールバックを削除）
 * - エラー処理をシンプル化
 * - パフォーマンスを向上
 */
const CachedImage: React.FC<CachedImageProps> = memo(({ 
  source, 
  style, 
  contentFit = 'cover',
  resizeMode,
  showLoadingIndicator = false,
  debugMode = false,
  productTitle,
  silentFallback = true,
  preload = false,
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // resizeModeとcontentFitの互換性を保つ
  const finalContentFit = resizeMode ? 
    (resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'contain' : resizeMode) : 
    contentFit;
  
  // 画像URLを最適化（メモ化）
  const imageSource = React.useMemo(() => {
    if (typeof source === 'number') {
      return source; // ローカル画像
    }
    
    const optimizedUrl = optimizeImageUrl(source.uri);
    
    // デバッグモード時のみログを出力
    if (debugMode && __DEV__) {
      console.log('[CachedImage] Loading:', {
        product: productTitle?.substring(0, 30),
        url: optimizedUrl?.substring(0, 80)
      });
    }
    
    return { uri: optimizedUrl };
  }, [source, productTitle, debugMode]);
  
  // フォールバック画像（統一された軽量画像）
  const fallbackSource = React.useMemo(() => {
    return { uri: 'https://via.placeholder.com/800x800/f5f5f5/cccccc?text=Loading' };
  }, []);
  
  // 画像読み込み成功
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    if (debugMode && __DEV__) {
      console.log(`[CachedImage] ✅ Loaded: ${productTitle?.substring(0, 30)}`);
    }
  };
  
  // 画像読み込みエラー（シンプル化）
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (debugMode && __DEV__) {
      console.warn(`[CachedImage] ❌ Failed: ${productTitle?.substring(0, 30)}`);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* ローディング表示（オプション） */}
      {isLoading && showLoadingIndicator && !silentFallback && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      
      {/* エラー時のフォールバック表示 */}
      {hasError && (
        <View style={[StyleSheet.absoluteFillObject, styles.errorContainer]}>
          <Ionicons name="image-outline" size={32} color="#ddd" />
        </View>
      )}
      
      {/* expo-imageのみを使用（シンプル化） */}
      <Image
        source={hasError ? fallbackSource : imageSource}
        style={StyleSheet.absoluteFillObject}
        contentFit={finalContentFit}
        cachePolicy="memory-disk" // キャッシュポリシーを明示
        priority={preload ? "low" : "normal"} // 優先度を調整
        transition={100} // トランジションを短く
        placeholder={fallbackSource}
        placeholderContentFit="cover"
        recyclingKey={productTitle} // キャッシュキー
        allowDownscaling={true}
        autoplay={false}
        responsivePolicy="live" // レスポンシブポリシーを追加
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...restProps}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // メモ化の条件を最適化
  if (typeof prevProps.source === 'number' && typeof nextProps.source === 'number') {
    return prevProps.source === nextProps.source;
  }
  if (typeof prevProps.source === 'object' && typeof nextProps.source === 'object') {
    return prevProps.source.uri === nextProps.source.uri &&
           prevProps.style === nextProps.style &&
           prevProps.contentFit === nextProps.contentFit;
  }
  return false;
});

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
});

// コンポーネント名を設定（デバッグ用）
CachedImage.displayName = 'CachedImage';

export default CachedImage;
