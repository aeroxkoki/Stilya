import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
  autoHideDuration?: number; // ミリ秒単位
  showIcon?: boolean;
}

/**
 * エラーメッセージを表示するバナーコンポーネント
 */
const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  type = 'error',
  onDismiss,
  autoHideDuration = 5000, // デフォルトで5秒後に自動で消える
  showIcon = true,
}) => {
  const [opacity] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // バナーを表示するアニメーション
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 自動で非表示にする場合
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        hide();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, []);

  // バナーを非表示にする関数
  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  // アイコンとカラーを設定
  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          iconName: 'alert-circle',
          backgroundColor: '#FFE8E6',
          textColor: '#D32F2F',
          iconColor: '#D32F2F',
        };
      case 'warning':
        return {
          iconName: 'warning',
          backgroundColor: '#FFF8E1',
          textColor: '#F57C00',
          iconColor: '#F57C00',
        };
      case 'info':
        return {
          iconName: 'information-circle',
          backgroundColor: '#E8F4FD',
          textColor: '#0288D1',
          iconColor: '#0288D1',
        };
      case 'success':
        return {
          iconName: 'checkmark-circle',
          backgroundColor: '#E8F5E9',
          textColor: '#388E3C',
          iconColor: '#388E3C',
        };
      default:
        return {
          iconName: 'alert-circle',
          backgroundColor: '#FFE8E6',
          textColor: '#D32F2F',
          iconColor: '#D32F2F',
        };
    }
  };

  const { iconName, backgroundColor, textColor, iconColor } = getIconAndColor();

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {showIcon && (
          <Ionicons
            name={iconName as any}
            size={20}
            color={iconColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={hide} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={iconColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ErrorBanner;
