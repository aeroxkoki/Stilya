import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  source?: any; // 後方互換性のため
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoadingIndicator?: boolean;
  showLoader?: boolean; // テストとの互換性のため
  placeholderColor?: string;
  blurRadius?: number;
  // 最適化のための追加プロパティ
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'memory' | 'memory-disk';
  containerStyle?: StyleProp<ViewStyle>;
  onLoad?: () => void;
  testID?: string;
}

/**
 * 最適化画像コンポーネント
 * - 低解像度プレースホルダーの使用
 * - メモリとディスクキャッシュの最適化
 * - 表示の優先順位付け
 * - アンマウント時のロード中断
 */
const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  source,
  style,
  containerStyle,
  resizeMode = 'cover',
  showLoadingIndicator = true,
  showLoader, // テストとの互換性のため
  placeholderColor,
  blurRadius = 0,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  onLoad,
  testID,
  ...rest
}) => {
  // sourceプロパティが渡された場合はそちらを優先
  const imageUri = useMemo(() => {
    if (source) {
      return typeof source === 'string' ? source : source.uri;
    }
    return uri;
  }, [source, uri]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme, isDarkMode } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const imageRef = useRef<Image>(null);
  
  // リアルタイム変更を防ぐためのメモ化
  const placeholderColorToUse = useMemo(
    () => placeholderColor || theme.colors.background.card,
    [placeholderColor, theme.colors.background.card]
  );

  // 解像度に応じたサイズ最適化
  const optimizedUri = useMemo(() => {
    if (!imageUri) return '';
    
    // CDNがある場合は最適化パラメータを付与（例: クラウディナリなど）
    // 今回はダミー実装
    return imageUri;
  }, [imageUri]);
  
  // 低解像度プレースホルダーURL（ぼかし画像用）
  const thumbUri = useMemo(() => {
    if (!imageUri || !blurRadius) return '';
    // 実際のプロダクトではCDN等で低解像度版を生成
    return imageUri;
  }, [imageUri, blurRadius]);

  useEffect(() => {
    if (!isLoading && !hasError) {
      // フェードインアニメーション
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      opacityAnim.setValue(0);
    }
    
    // クリーンアップ関数 - アンマウント時にロードを中断
    return () => {
      if (imageRef.current) {
        try {
          // @ts-ignore - expo-imageにはキャンセルAPIが公開されていないため
          imageRef.current.cancel?.();
        } catch (e) {
          // エラー無視
        }
      }
    };
  }, [isLoading, hasError, opacityAnim]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, containerStyle || style]} testID={testID}>
      {/* バックグラウンドプレースホルダー */}
      <View
        style={[
          styles.placeholder,
          { backgroundColor: placeholderColorToUse },
          style,
        ]}
      />

      {/* 低解像度プレースホルダー（ぼかし効果あり） */}
      {blurRadius > 0 && thumbUri && (
        <Image
          style={[
            styles.image,
            style,
            { position: 'absolute' }
          ]}
          source={{ uri: thumbUri }}
          resizeMode={resizeMode}
          blurRadius={blurRadius}
          transition={100}
          recyclingKey={`thumb-${thumbUri}`}
        />
      )}

      {/* メイン画像 */}
      {!hasError && (
        <Animated.View style={{ opacity: opacityAnim, flex: 1 }}>
          <Image
            ref={imageRef}
            source={{ uri: optimizedUri }}
            style={[styles.image, style]}
            resizeMode={resizeMode}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadComplete}
            onError={handleError}
            contentFit={resizeMode as any}
            transition={300}
            recyclingKey={`main-${optimizedUri}`}
            cachePolicy={cachePolicy}
            {...rest}
          />
        </Animated.View>
      )}

      {/* エラー表示 */}
      {hasError && (
        <View style={[styles.errorContainer, style]}>
          <Feather 
            name="image" 
            size={24} 
            color={isDarkMode ? theme.colors.text.hint : theme.colors.text.secondary} 
          />
        </View>
      )}

      {/* ローディングインジケーター */}
      {isLoading && (showLoadingIndicator || showLoader) && (
        <View style={[
          styles.loadingContainer, 
          style, 
          { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)' }
        ]}>
          <ActivityIndicator
            color={theme.colors.primary}
            size="small"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(CachedImage);
