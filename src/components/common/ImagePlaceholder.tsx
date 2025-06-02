import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StylePlaceholderProps {
  styleName: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

// スタイルごとの色定義（MVPフェーズ用）
const styleColors: Record<string, { bg: string; text: string; icon: string }> = {
  casual: { bg: '#F3F4F6', text: '#6B7280', icon: '#9CA3AF' },
  street: { bg: '#1F2937', text: '#F9FAFB', icon: '#E5E7EB' },
  mode: { bg: '#000000', text: '#FFFFFF', icon: '#9CA3AF' },
  natural: { bg: '#FEF3C7', text: '#92400E', icon: '#D97706' },
  classic: { bg: '#1E3A8A', text: '#DBEAFE', icon: '#93C5FD' },
  feminine: { bg: '#FCE7F3', text: '#BE185D', icon: '#EC4899' },
};

/**
 * スタイル画像のプレースホルダーコンポーネント
 * MVP開発中の画像代替として使用
 */
export const StylePlaceholder: React.FC<StylePlaceholderProps> = ({
  styleName,
  width = 100,
  height = 100,
  style,
}) => {
  const colors = styleColors[styleName] || { bg: '#E5E7EB', text: '#4B5563', icon: '#9CA3AF' };
  
  return (
    <View
      style={[
        styles.container,
        { width, height, backgroundColor: colors.bg },
        style,
      ]}
    >
      <Ionicons name="shirt-outline" size={width * 0.3} color={colors.icon} />
      <Text style={[styles.text, { color: colors.text }]}>
        {styleName.toUpperCase()}
      </Text>
    </View>
  );
};

/**
 * 画像プレースホルダーコンポーネント（汎用）
 */
interface ImagePlaceholderProps {
  text?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  text = 'IMAGE',
  width = 100,
  height = 100,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        { width, height, backgroundColor: '#E5E7EB' },
        style,
      ]}
    >
      <Ionicons name="image-outline" size={width * 0.3} color="#9CA3AF" />
      <Text style={[styles.text, { color: '#6B7280' }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
