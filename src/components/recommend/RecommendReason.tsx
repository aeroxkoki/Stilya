import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, UserPreference } from '@/types';

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

  // コンパクト表示の場合（リスト内など）
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
        <Text style={styles.compactText} numberOfLines={1}>
          {reasonMessage}
        </Text>
      </View>
    );
  }

  // 詳細表示の場合（商品詳細画面など）
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        あなたにおすすめの理由
      </Text>
      <Text style={styles.message}>
        {reasonMessage}
      </Text>
      {matchingTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {matchingTags.map(tag => (
            <View 
              key={tag} 
              style={styles.tag}
            >
              <Text style={styles.tagText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
});

export default RecommendReason;
