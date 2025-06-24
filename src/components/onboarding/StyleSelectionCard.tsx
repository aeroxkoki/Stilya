import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleType, styleThemes } from '@/styles/theme';
import { useStyle } from '@/contexts/ThemeContext';

interface StyleSelectionCardProps {
  styleType: StyleType;
  isSelected: boolean;
  onSelect: (styleType: StyleType) => void;
  testID?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

const StyleSelectionCard: React.FC<StyleSelectionCardProps> = ({
  styleType,
  isSelected,
  onSelect,
  testID,
}) => {
  const { theme: currentTheme } = useStyle();
  const styleTheme = styleThemes[styleType];
  
  // 動的スタイルを生成
  const dynamicStyles = {
    container: {
      width: CARD_WIDTH,
      padding: 16,
      marginVertical: 8,
      backgroundColor: currentTheme.colors.background,
      shadowColor: styleTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    previewButtonText: {
      color: currentTheme.colors.background,
      fontSize: 14,
      fontWeight: '500' as const,
    },
  };
  
  // スタイルごとの表示名とアイコン
  const styleInfo: Record<StyleType, { name: string; icon: string; description: string }> = {
    minimal: {
      name: 'ミニマル',
      icon: 'square-outline',
      description: 'シャープでモダンなデザイン',
    },
    natural: {
      name: 'ナチュラル',
      icon: 'leaf-outline',
      description: '柔らかく有機的な印象',
    },
    bold: {
      name: 'ボールド',
      icon: 'flash-outline',
      description: '大胆で鮮やかな表現',
    },
  };

  return (
    <TouchableOpacity
      style={[
        dynamicStyles.container,
        {
          borderColor: styleTheme.colors.primary,
          borderRadius: styleTheme.radius.m,
          backgroundColor: isSelected ? `${styleTheme.colors.primary}10` : 'transparent',
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(styleType)}
      activeOpacity={0.7}
      testID={testID || `style-card-${styleType}`}
    >
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          {
            backgroundColor: `${styleTheme.colors.primary}20`,
            borderRadius: styleTheme.radius.s,
          }
        ]}>
          <Ionicons
            name={styleInfo[styleType].icon as any}
            size={32}
            color={styleTheme.colors.primary}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: currentTheme.colors.text.primary }]}>
            {styleInfo[styleType].name}
          </Text>
          <Text style={[styles.description, { color: currentTheme.colors.text.secondary }]}>
            {styleInfo[styleType].description}
          </Text>
        </View>
        
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: styleTheme.colors.primary }]}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      
      {/* プレビュー要素 */}
      <View style={[
        styles.previewContainer,
        { 
          backgroundColor: currentTheme.colors.background,
          borderRadius: styleTheme.radius.s,
        }
      ]}>
        {/* ボタンプレビュー */}
        <View style={[
          styles.previewButton,
          { 
            backgroundColor: styleTheme.colors.button.primary,
            borderRadius: styleTheme.radius.s,
          }
        ]}>
          <Text style={dynamicStyles.previewButtonText}>ボタン</Text>
        </View>
        
        {/* テキスト要素プレビュー */}
        <View style={styles.previewTextContainer}>
          <View style={styles.previewTextLine} />
          <View style={[styles.previewTextLine, { width: '60%' }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    marginTop: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  previewTextLine: {
    height: 6,
    width: '80%',
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginVertical: 3,
  },
});

export default StyleSelectionCard;
