import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleType, styleThemes } from '../../styles/theme';

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
  const theme = styleThemes[styleType];
  
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
        styles.container,
        {
          borderColor: theme.colors.primary,
          borderRadius: theme.radius.m,
          backgroundColor: isSelected ? `${theme.colors.primary}10` : 'transparent',
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
            backgroundColor: `${theme.colors.primary}20`,
            borderRadius: theme.radius.s,
          }
        ]}>
          <Ionicons
            name={styleInfo[styleType].icon as any}
            size={32}
            color={theme.colors.primary}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {styleInfo[styleType].name}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {styleInfo[styleType].description}
          </Text>
        </View>
        
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>
      
      {/* プレビュー要素 */}
      <View style={[
        styles.previewContainer,
        { 
          backgroundColor: theme.colors.background,
          borderRadius: theme.radius.s,
        }
      ]}>
        {/* ボタンプレビュー */}
        <View style={[
          styles.previewButton,
          { 
            backgroundColor: theme.colors.button.primary,
            borderRadius: theme.radius.s,
          }
        ]}>
          <Text style={styles.previewButtonText}>ボタン</Text>
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
  container: {
    width: CARD_WIDTH,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
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
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
