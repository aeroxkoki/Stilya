import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { UserPreference } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

interface StyleTypeDisplayProps {
  userPreference: UserPreference;
}

interface StyleType {
  id: string;
  name: string;
  description: string;
  image: ImageSourcePropType;
  tags: string[];
}

// 定義済みのスタイルタイプ
const STYLE_TYPES: StyleType[] = [
  {
    id: 'casual',
    name: 'カジュアル',
    description: '日常的で着心地のよい、リラックスしたスタイル',
    image: require('../../assets/style-casual.png'),
    tags: ['カジュアル', 'デイリー', 'シンプル', 'ベーシック', 'ナチュラル']
  },
  {
    id: 'mode',
    name: 'モード',
    description: '洗練されたシルエットと都会的なエッセンスを持つスタイル',
    image: require('../../assets/style-mode.png'),
    tags: ['モード', 'モノトーン', '都会的', 'ミニマル', 'クール']
  },
  {
    id: 'classic',
    name: 'クラシック',
    description: '時代を超えた普遍的なデザインと上品さを備えたスタイル',
    image: require('../../assets/style-classic.png'),
    tags: ['クラシック', 'エレガント', 'フォーマル', '上品', 'トラッド']
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '素材感を活かした自然体で優しい印象のスタイル',
    image: require('../../assets/style-natural.png'),
    tags: ['ナチュラル', 'オーガニック', '優しい', 'リラックス', 'コットン']
  },
  {
    id: 'street',
    name: 'ストリート',
    description: '都市文化やスポーツの要素を取り入れた個性的なスタイル',
    image: require('../../assets/style-street.png'),
    tags: ['ストリート', 'スポーティ', '個性的', 'カジュアル', 'ワイド']
  },
  {
    id: 'feminine',
    name: 'フェミニン',
    description: '女性らしさや柔らかさを強調した優美なスタイル',
    image: require('../../assets/style-feminine.png'),
    tags: ['フェミニン', 'ガーリー', 'ロマンティック', 'スウィート', '華やか']
  }
];

const StyleTypeDisplay: React.FC<StyleTypeDisplayProps> = ({ userPreference }) => {
  const { theme } = useStyle();
  
  if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
    return null;
  }
  
  const topTags = userPreference.topTags;
  const tagScores = userPreference.tagScores || {};
  
  // ユーザーの好みのタグから、最も合致するスタイルタイプを計算
  const matchedStyles = STYLE_TYPES.map(style => {
    let matchScore = 0;
    
    // スタイルタイプのタグがユーザーの好みのタグに含まれているかチェック
    style.tags.forEach(tag => {
      if (topTags.includes(tag)) {
        matchScore += 1;
      }
      
      // タグスコアも考慮（タグスコアが高いものはより高いスコアを加算）
      if (tagScores[tag]) {
        matchScore += tagScores[tag] * 0.5;
      }
    });
    
    return {
      ...style,
      matchScore
    };
  })
  .filter(style => style.matchScore > 0) // マッチしたスタイルのみ
  .sort((a, b) => b.matchScore - a.matchScore) // スコアの高い順にソート
  .slice(0, 3); // 上位3つのみ表示
  
  if (matchedStyles.length === 0) {
    return null;
  }
  
  // 動的スタイル
  const dynamicStyles = {
    container: {
      marginVertical: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 8
    },
    styleCard: {
      width: 280,
      backgroundColor: theme.colors.card.background,
      borderRadius: 12,
      marginRight: 12,
      shadowColor: theme.colors.card.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    styleImage: {
      width: '100%' as const,
      height: 160,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    styleInfo: {
      padding: 16,
    },
    styleName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    styleDescription: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    tagsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 6,
    },
    tag: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  };
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>あなたのスタイルタイプ</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollContent}
      >
        {matchedStyles.map(style => (
          <View key={style.id} style={dynamicStyles.styleCard}>
            <Image 
              source={style.image} 
              style={dynamicStyles.styleImage}
              resizeMode="cover"
            />
            <View style={dynamicStyles.styleInfo}>
              <Text style={dynamicStyles.styleName}>{style.name}</Text>
              <Text style={dynamicStyles.styleDescription}>{style.description}</Text>
              <View style={dynamicStyles.tagsContainer}>
                {style.tags.slice(0, 3).map(tag => (
                  <View key={tag} style={dynamicStyles.tag}>
                    <Text style={dynamicStyles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default StyleTypeDisplay;
