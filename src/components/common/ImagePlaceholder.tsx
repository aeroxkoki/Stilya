import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StylePlaceholderProps {
  styleName: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

// スタイルごとの色定義（改良版）
const styleColors: Record<string, { 
  bg: string; 
  gradient?: readonly [string, string, ...string[]];
  text: string; 
  icon: string;
  iconName?: string;
  iconFamily?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';
}> = {
  casual: { 
    bg: '#FEF3C7', 
    gradient: ['#FBBF24', '#F59E0B'],
    text: '#92400E', 
    icon: '#F59E0B',
    iconName: 'tshirt',
    iconFamily: 'FontAwesome5'
  },
  street: { 
    bg: '#FEE2E2', 
    gradient: ['#EF4444', '#DC2626'],
    text: '#991B1B', 
    icon: '#EF4444',
    iconName: 'skateboarding',
    iconFamily: 'FontAwesome5'
  },
  mode: { 
    bg: '#1F2937', 
    gradient: ['#374151', '#111827'],
    text: '#FFFFFF', 
    icon: '#FFFFFF',
    iconName: 'diamond-outline',
    iconFamily: 'Ionicons'
  },
  natural: { 
    bg: '#ECFDF5', 
    gradient: ['#34D399', '#10B981'],
    text: '#047857', 
    icon: '#10B981',
    iconName: 'leaf',
    iconFamily: 'Ionicons'
  },
  classic: { 
    bg: '#EDE9FE', 
    gradient: ['#7C3AED', '#6D28D9'],
    text: '#5B21B6', 
    icon: '#7C3AED',
    iconName: 'business',
    iconFamily: 'Ionicons'
  },
  feminine: { 
    bg: '#FCE7F3', 
    gradient: ['#EC4899', '#DB2777'],
    text: '#BE185D', 
    icon: '#EC4899',
    iconName: 'flower-outline',
    iconFamily: 'Ionicons'
  },
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
  const colors = styleColors[styleName] || { 
    bg: '#E5E7EB', 
    text: '#4B5563', 
    icon: '#9CA3AF',
    iconName: 'shirt-outline',
    iconFamily: 'Ionicons' as const
  };
  
  const renderIcon = () => {
    const iconSize = Math.min(width, height) * 0.3;
    const iconProps = {
      size: iconSize,
      color: colors.icon,
      name: colors.iconName || 'shirt-outline',
    };

    switch (colors.iconFamily) {
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} name={iconProps.name as any} />;
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} name={iconProps.name as any} />;
      default:
        return <Ionicons {...iconProps} name={iconProps.name as any} />;
    }
  };
  
  return (
    <View style={[styles.container, { width, height }, style]}>
      {colors.gradient ? (
        <LinearGradient
          colors={colors.gradient}
          style={[styles.gradientBackground, { width, height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <Text style={[styles.text, { color: colors.text }]}>
            {styleName.toUpperCase()}
          </Text>
        </LinearGradient>
      ) : (
        <View style={[styles.solidBackground, { width, height, backgroundColor: colors.bg }]}>
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <Text style={[styles.text, { color: colors.text }]}>
            {styleName.toUpperCase()}
          </Text>
        </View>
      )}
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
    overflow: 'hidden',
  },
  gradientBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  solidBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconContainer: {
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
