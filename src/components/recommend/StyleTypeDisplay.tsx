import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { UserPreference } from '@/types';

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
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>あなたのスタイルタイプ</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {matchedStyles.map(style => (
          <View key={style.id} style={styles.styleCard}>
            <Image 
              source={style.image} 
              style={styles.styleImage}
              resizeMode="cover"
            />
            <View style={styles.styleInfo}>
              <Text style={styles.styleName}>{style.name}</Text>
              <Text style={styles.styleDescription}>{style.description}</Text>
              <View style={styles.tagsContainer}>
                {style.tags.slice(0, 3).map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  styleCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  styleImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  styleInfo: {
    padding: 16,
  },
  styleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
});

export default StyleTypeDisplay;
