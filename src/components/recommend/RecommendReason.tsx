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

  // 商品の各タグがユーザーの好みとどれだけ一致しているか計算
  const matchingTags = product.tags
    .filter(tag => userPreference.tagScores[tag] && userPreference.tagScores[tag] > 0)
    .sort((a, b) => userPreference.tagScores[b] - userPreference.tagScores[a])
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
      <View className="mt-1 mb-2 flex-row items-center">
        <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
        <Text className="text-xs text-green-700 ml-1" numberOfLines={1}>
          {reasonMessage}
        </Text>
      </View>
    );
  }

  // 詳細表示の場合（商品詳細画面など）
  return (
    <View className="bg-green-50 p-3 rounded-lg mb-4">
      <Text className="text-sm font-bold text-green-800 mb-1">
        あなたにおすすめの理由
      </Text>
      <Text className="text-sm text-green-700">
        {reasonMessage}
      </Text>
      {matchingTags.length > 0 && (
        <View className="flex-row flex-wrap mt-2">
          {matchingTags.map(tag => (
            <View 
              key={tag} 
              className="bg-green-100 rounded-full px-2 py-1 mr-2 mb-1"
            >
              <Text className="text-xs text-green-800">
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
  // 必要に応じてスタイルを追加
});

export default RecommendReason;
