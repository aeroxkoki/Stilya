import React, { useState, useEffect } from 'react';
import { StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoadingIndicator?: boolean;
  debugMode?: boolean; // デバッグモードを追加
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
  debugMode = false, // デバッグモードを追加
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  // デバッグ用: 最初の画像エラーのみアラートを表示
  const [hasShownAlert, setHasShownAlert] = useState(false);
  
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
    // デバッグログ
    console.log('[CachedImage] Image URL optimization:', {
      original: source.uri,
      optimized: optimizedUrl,
      changed: source.uri !== optimizedUrl
    });
    return { uri: optimizedUrl };
  }, [source]);
  
  // エラー時のフォールバック画像（Picsum Photos - 常に利用可能）
  const fallbackSource = { uri: 'https://picsum.photos/400/400?grayscale' };
  
  // デバッグモードでエラー詳細を表示
  useEffect(() => {
    if (debugMode && hasError && errorDetails && !hasShownAlert) {
      setHasShownAlert(true);
      const url = typeof imageSource === 'object' && 'uri' in imageSource ? imageSource.uri : 'unknown';
      Alert.alert(
        '画像読み込みエラー',
        `URL: ${url}\n\nエラー詳細: ${JSON.stringify(errorDetails, null, 2)}`,
        [{ text: 'OK' }]
      );
    }
  }, [hasError, errorDetails, debugMode, hasShownAlert, imageSource]);
  
  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoadingIndicator && (
        <ActivityIndicator size="small" color="#999" style={styles.loader} />
      )}
      
      {hasError ? (
        <View style={[StyleSheet.absoluteFillObject, styles.errorContainer]}>
          <Ionicons name="image-outline" size={48} color="#999" />
          <Text style={styles.errorText}>画像を読み込めませんでした</Text>
        </View>
      ) : (
        <Image
          source={hasError ? fallbackSource : imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit={finalContentFit}
          cachePolicy="memory-disk"
          priority="normal"
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoad={() => setIsLoading(false)}
          onError={(event) => {
            setIsLoading(false);
            setHasError(true);
            setErrorDetails(event.error);
            console.warn('[CachedImage] Failed to load image:', {
              url: typeof imageSource === 'object' && 'uri' in imageSource ? imageSource.uri : 'unknown',
              error: event.error,
              fullEvent: event
            });
          }}
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
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
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
});

export default CachedImage;
