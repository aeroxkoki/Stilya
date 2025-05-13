import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoadingIndicator?: boolean;
  placeholderColor?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  showLoadingIndicator = true,
  placeholderColor,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme, isDarkMode } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const placeholderColorToUse = placeholderColor || theme.colors.background.card;

  useEffect(() => {
    if (!isLoading && !hasError) {
      // フェードインアニメーション
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      opacityAnim.setValue(0);
    }
  }, [isLoading, hasError]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {/* バックグラウンドプレースホルダー */}
      <View
        style={[
          styles.placeholder,
          { backgroundColor: placeholderColorToUse },
          style,
        ]}
      />

      {!hasError && (
        <Animated.Image
          source={{ uri }}
          style={[
            styles.image,
            style,
            { opacity: opacityAnim },
          ]}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...rest}
        />
      )}

      {hasError && (
        <View style={[styles.errorContainer, style]}>
          <Feather 
            name="image" 
            size={24} 
            color={isDarkMode ? theme.colors.text.hint : theme.colors.text.secondary} 
          />
        </View>
      )}

      {isLoading && showLoadingIndicator && (
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

export default CachedImage;
