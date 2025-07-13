import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StylePlaceholder, ImagePlaceholder } from '@/components/common/ImagePlaceholder';

/**
 * Stilyaロゴのプレースホルダー
 */
export const LogoPlaceholder = ({ size = 200 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logo}>
      <View style={[styles.logoCircle, { width: size * 0.9, height: size * 0.9 }]} />
      <View style={styles.logoS}>
        <View style={[styles.sTop, { width: size * 0.4 }]} />
        <View style={[styles.sMiddle, { width: size * 0.4 }]} />
        <View style={[styles.sBottom, { width: size * 0.4 }]} />
      </View>
    </View>
  </View>
);

/**
 * ウェルカムイラストのプレースホルダー
 */
export const WelcomeIllustrationPlaceholder = ({ width = 600, height = 400 }: { width?: number; height?: number }) => (
  <View style={[styles.illustrationContainer, { width, height }]}>
    <View style={styles.hangerGroup}>
      <View style={[styles.hanger, styles.hanger1]} />
      <View style={[styles.hanger, styles.hanger2]} />
      <View style={[styles.hanger, styles.hanger3]} />
    </View>
    <View style={styles.swipeIndicator}>
      <View style={styles.hand} />
      <View style={styles.arrow} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  // ロゴスタイル
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 1000,
    position: 'absolute',
  },
  logoS: {
    position: 'relative',
  },
  sTop: {
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginBottom: 8,
  },
  sMiddle: {
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginBottom: 8,
  },
  sBottom: {
    height: 4,
    backgroundColor: '#EC4899',
    borderRadius: 2,
  },
  
  // イラストスタイル
  illustrationContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangerGroup: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  hanger: {
    width: 60,
    height: 80,
    borderWidth: 3,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  hanger1: {
    borderColor: '#3B82F6',
    transform: [{ rotate: '-5deg' }],
  },
  hanger2: {
    borderColor: '#8B5CF6',
    transform: [{ rotate: '0deg' }],
  },
  hanger3: {
    borderColor: '#EC4899',
    transform: [{ rotate: '5deg' }],
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hand: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
  },
  arrow: {
    width: 60,
    height: 3,
    backgroundColor: '#3B82F6',
    marginLeft: 10,
  },
});

// 既存のコンポーネントもエクスポート
export { StylePlaceholder, ImagePlaceholder };
