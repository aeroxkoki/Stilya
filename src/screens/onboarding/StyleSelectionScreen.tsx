import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { StyleType, styleThemes } from '@/styles/theme';
import { Button } from '@/components/common';
import { OnboardingStackParamList } from '@/navigation/types';

// スタイル表示名
const STYLE_NAMES: Record<StyleType, string> = {
  minimal: 'ミニマル',
  natural: 'ナチュラル',
  bold: 'ボールド',
};

// スタイル説明文
const STYLE_DESCRIPTIONS: Record<StyleType, string> = {
  minimal: 'シャープでモダンなデザイン。洗練された現代的なスタイルを好む方におすすめ。',
  natural: '柔らかく温かみのあるデザイン。親しみやすく優しい印象を好む方におすすめ。',
  bold: '大胆で鮮やかなデザイン。個性的で印象的なスタイルを好む方におすすめ。',
};

// スタイル特徴
const STYLE_FEATURES: Record<StyleType, string[]> = {
  minimal: [
    'シャープな角とミニマルデザイン',
    'モノトーンベースのカラーパレット',
    '情報の階層化と視覚的な余白',
    '洗練された現代的な印象',
  ],
  natural: [
    '丸みを帯びた柔らかいデザイン',
    'アースカラーパレット',
    '有機的な形状と自然な流れ',
    '親しみやすく温かみのある印象',
  ],
  bold: [
    '大胆なカラーと鮮やかな対比',
    '個性的なビジュアル要素',
    'エネルギッシュな印象',
    'インパクトを重視したデザイン',
  ],
};

// スタイルプレビューコンポーネント
const StylePreview: React.FC<{ style: StyleType }> = ({ style }) => {
  const theme = styleThemes[style];
  
  return (
    <View style={[styles.previewContainer, { backgroundColor: theme.colors.background }]}>
      {/* ヘッダー部分 */}
      <View style={[styles.previewHeader, { backgroundColor: theme.colors.primary }]}>
        <View style={[styles.previewDot, { backgroundColor: '#fff' }]} />
        <View style={[styles.previewDot, { backgroundColor: '#fff' }]} />
        <View style={[styles.previewDot, { backgroundColor: '#fff' }]} />
      </View>
      
      {/* コンテンツ部分 */}
      <View style={styles.previewContent}>
        {/* カードのプレビュー */}
        <View style={[
          styles.previewCard,
          { 
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.m,
            shadowColor: theme.colors.primary,
          }
        ]}>
          <View style={[styles.previewImage, { backgroundColor: theme.colors.primary + '20' }]} />
          <View style={styles.previewTextContainer}>
            <View style={[styles.previewTextLine, { backgroundColor: theme.colors.primary, width: '60%' }]} />
            <View style={[styles.previewTextLine, { backgroundColor: theme.colors.primary + '40', width: '80%' }]} />
          </View>
        </View>
        
        {/* ボタンのプレビュー */}
        <View style={[
          styles.previewButton,
          { 
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.s
          }
        ]} />
      </View>
    </View>
  );
};

type StyleSelectionScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'StyleSelection'>;

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ navigation }) => {
  const { theme, styleType, setStyleType } = useStyle();
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(styleType);
  const { width } = Dimensions.get('window');

  // スタイル選択の処理
  const handleStyleSelection = (style: StyleType) => {
    setSelectedStyle(style);
  };

  // 選択完了の処理
  const handleComplete = () => {
    // コンテキストに選択したスタイルを設定
    setStyleType(selectedStyle);
    // 次の画面へ進む
    navigation.navigate('Complete');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>あなたの好みのスタイルを選択</Text>
        <Text style={styles.subtitle}>
          あなたに合ったデザインテーマを選んでください。あとからいつでも変更できます。
        </Text>

        {/* スタイル選択カード */}
        <View style={styles.styleCards}>
          {(['minimal', 'natural', 'bold'] as StyleType[]).map((style) => {
            const theme = styleThemes[style];
            const isSelected = selectedStyle === style;

            return (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleCard,
                  {
                    borderRadius: theme.radius.m,
                    borderColor: isSelected ? theme.colors.primary : '#e0e0e0',
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleStyleSelection(style)}
                activeOpacity={0.7}
              >
                {/* スタイルプレビュー */}
                <StylePreview style={style} />

                {/* スタイル情報 */}
                <View style={styles.styleInfo}>
                  <View style={styles.styleNameContainer}>
                    <Text 
                      style={[
                        styles.styleName,
                        { color: theme.colors.primary }
                      ]}
                    >
                      {STYLE_NAMES[style]}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={theme.colors.primary} 
                        style={styles.selectedIcon}
                      />
                    )}
                  </View>
                  <Text style={styles.styleDescription}>
                    {STYLE_DESCRIPTIONS[style]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 選択したスタイルの特徴 */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>選択したスタイルの特徴</Text>
          <View 
            style={[
              styles.featuresCard,
              {
                borderRadius: styleThemes[selectedStyle].radius.m,
                backgroundColor: `${styleThemes[selectedStyle].colors.primary}10`
              }
            ]}
          >
            {STYLE_FEATURES[selectedStyle].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={styleThemes[selectedStyle].colors.primary} 
                />
                <Text 
                  style={[
                    styles.featureText,
                    { color: styleThemes[selectedStyle].colors.text.primary }
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 次へボタン */}
      <View style={styles.buttonContainer}>
        <Button 
          title="このスタイルを選択" 
          onPress={handleComplete}
          style={{
            backgroundColor: styleThemes[selectedStyle].colors.primary,
            borderRadius: styleThemes[selectedStyle].radius.m
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  styleCards: {
    marginBottom: 20,
  },
  styleCard: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  styleInfo: {
    padding: 15,
  },
  styleNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  styleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedIcon: {
    marginLeft: 8,
  },
  styleDescription: {
    fontSize: 14,
    color: '#666666',
  },
  featuresContainer: {
    marginBottom: 60,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  featuresCard: {
    padding: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  // スタイルプレビュー用のスタイル
  previewContainer: {
    height: 180,
    padding: 10,
  },
  previewHeader: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewContent: {
    flex: 1,
    padding: 10,
  },
  previewCard: {
    flex: 1,
    padding: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  previewImage: {
    height: 60,
    marginBottom: 8,
    borderRadius: 8,
  },
  previewTextContainer: {
    gap: 4,
  },
  previewTextLine: {
    height: 8,
    borderRadius: 4,
  },
  previewButton: {
    height: 28,
    marginTop: 10,
  },
});

export default StyleSelectionScreen;