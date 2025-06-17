import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  size?: 'small' | 'large';
}

/**
 * ローディングインジケータコンポーネント
 * 
 * @param message - 表示するメッセージ
 * @param fullscreen - フルスクリーン表示するかどうか
 * @param overlay - オーバーレイとして表示するかどうか
 * @param size - インジケータのサイズ
 */
const Loading: React.FC<LoadingProps> = ({
  message,
  fullscreen = false,
  overlay = false,
  size = 'large',
}) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullscreen && styles.fullscreen,
        overlay && styles.overlay,
        { backgroundColor: overlay 
            ? (isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)')
            : (fullscreen ? theme.colors.main.background : 'transparent') 
        }
      ]}
    >
      <View 
        style={[
          styles.loaderContainer,
          { 
            backgroundColor: isDarkMode 
              ? theme.colors.card.background 
              : theme.colors.main.background,
            shadowColor: isDarkMode ? '#000' : '#222',
            borderColor: theme.colors.border,
            borderWidth: isDarkMode ? 1 : 0,
          }
        ]}
      >
        <ActivityIndicator
          size={size}
          color={theme.colors.primary}
          style={styles.indicator}
        />
        {message && (
          <Text 
            style={[
              styles.message,
              { color: theme.colors.text.primary }
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 120,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  indicator: {
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Loading;
