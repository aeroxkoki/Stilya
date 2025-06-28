import React, { useState } from 'react';
import { StyleProp, ImageStyle, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '@/utils/imageUtils';

interface CachedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoadingIndicator?: boolean;
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
  ...restProps 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
    return { uri: optimizedUrl };
  }, [source]);
  
  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoadingIndicator && (
        <ActivityIndicator size="small" color="#999" style={styles.loader} />
      )}
      
      <Image
        source={imageSource}
        style={StyleSheet.absoluteFillObject}
        contentFit={finalContentFit}
        cachePolicy="memory-disk"
        priority="normal"
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={(event) => {
          setIsLoading(false);
          console.warn('[CachedImage] Failed to load image:', event.error);
        }}
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
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 1,
  },
});

export default CachedImage;
