import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, UserPreference } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

interface RecommendReasonProps {
  product: Product;
  userPreference: UserPreference | null;
  compact?: boolean;
}

const RecommendReason: React.FC<RecommendReasonProps> = ({
  product,
  userPreference,
  compact = false
}) => {
  const { theme } = useStyle();
  
  // ユーザー好みが存在しない場合
  if (!userPreference || !userPreference.tagScores || !product.tags) {
    return null;
  }

  const tagScores = userPreference.tagScores;

  // 商品の各タグがユーザーの好みとどれだけ一致しているか計算
  const matchingTags = product.tags
    .filter(tag => tagScores[tag] && tagScores[tag] > 0)
    .sort((a, b) => tagScores[b] - tagScores[a])
    .slice(0, 3); // 上位3つのタグのみ

  // マッチしたタグがない場合
  if (matchingTags.length === 0) {
    return null;
  }

  // スタイルに合わせた理由メッセージの生成
  let reasonMessage = '';
  if (matchingTags.length === 1) {
    reasonMessage = `あなたが好きな「${matchingTags[0]}」スタイルに合っています`;
  } else {
    const lastTag = matchingTags.pop();
    reasonMessage = `あなたが好きな「${matchingTags.join('」「')}」と「${lastTag}」の要素があります`;
  }

  // 動的スタイル
  const dynamicStyles = {
    compactContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
    },
    compactText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    container: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginVertical: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      marginBottom: 8,
      color: theme.colors.text.primary,
    },
    message: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 12,
    },
    tagsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    tag: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.text.primary,
    },
  };

  // コンパクト表示の場合（リスト内など）
  if (compact) {
    return (
      <View style={dynamicStyles.compactContainer}>
        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
        <Text style={dynamicStyles.compactText} numberOfLines={1}>
          {reasonMessage}
        </Text>
      </View>
    );
  }

  // 詳細表示の場合（商品詳細画面など）
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>
        あなたにおすすめの理由
      </Text>
      <Text style={dynamicStyles.message}>
        {reasonMessage}
      </Text>
      {matchingTags.length > 0 && (
        <View style={dynamicStyles.tagsContainer}>
          {matchingTags.map(tag => (
            <View 
              key={tag} 
              style={dynamicStyles.tag}
            >
              <Text style={dynamicStyles.tagText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default RecommendReason;
