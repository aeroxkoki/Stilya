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
    image: require('@/assets/style-casual.png'),
    tags: ['カジュアル', 'デイリー', 'シンプル', 'ベーシック', 'ナチュラル']
  },
  {
    id: 'mode',
    name: 'モード',
    description: '洗練されたシルエットと都会的なエッセンスを持つスタイル',
    image: require('@/assets/style-mode.png'),
    tags: ['モード', 'モノトーン', '都会的', 'ミニマル', 'クール']
  },
  {
    id: 'classic',
    name: 'クラシック',
    description: '時代を超えた普遍的なデザインと上品さを備えたスタイル',
    image: require('@/assets/style-classic.png'),
    tags: ['クラシック', 'エレガント', 'フォーマル', '上品', 'トラッド']
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '素材感を活かした自然体で優しい印象のスタイル',
    image: require('@/assets/style-natural.png'),
    tags: ['ナチュラル', 'オーガニック', '優しい', 'リラックス', 'コットン']
  },
  {
    id: 'street',
    name: 'ストリート',
    description: '都市文化やスポーツの要素を取り入れた個性的なスタイル',
    image: require('@/assets/style-street.png'),
    tags: ['ストリート', 'スポーティ', '個性的', 'カジュアル', 'ワイド']
  },
  {
    id: 'feminine',
    name: 'フェミニン',
    description: '女性らしさや柔らかさを強調した優美なスタイル',
    image: require('@/assets/style-feminine.png'),
    tags: ['フェミニン', 'ガーリー', 'ロマンティック', 'スウィート', '華やか']
  }
];

const StyleTypeDisplay: React.FC<StyleTypeDisplayProps> = ({ userPreference }) => {
  if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
    return null;
  }
  
  // ユーザーの好みのタグから、最も合致するスタイルタイプを計算
  const matchedStyles = STYLE_TYPES.map(style => {
    let matchScore = 0;
    
    // スタイルタイプのタグがユーザーの好みのタグに含まれているかチェック
    style.tags.forEach(tag => {
      if (userPreference.topTags.includes(tag)) {
        matchScore += 1;
      }
      
      // タグスコアも考慮（タグスコアが高いものはより高いスコアを加算）
      if (userPreference.tagScores[tag]) {
        matchScore += userPreference.tagScores[tag] * 0.5;
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
    <View className="mb-6">
      <Text className="text-lg font-bold mb-3 px-4">あなたのスタイルタイプ</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {matchedStyles.map(style => (
          <View key={style.id} className="bg-white rounded-lg shadow-sm mr-4 w-64 overflow-hidden">
            <Image 
              source={style.image} 
              className="w-full h-32"
              resizeMode="cover"
            />
            <View className="p-3">
              <Text className="text-base font-bold mb-1">{style.name}</Text>
              <Text className="text-sm text-gray-600 mb-2">{style.description}</Text>
              <View className="flex-row flex-wrap">
                {style.tags.slice(0, 3).map(tag => (
                  <View key={tag} className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                    <Text className="text-xs text-gray-700">{tag}</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});

export default StyleTypeDisplay;
