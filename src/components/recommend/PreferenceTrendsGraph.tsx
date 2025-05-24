import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { UserPreference } from '@/types';

interface PreferenceTrendsGraphProps {
  userPreference: UserPreference;
}

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width * 0.6; // グラフの最大幅（画面の60%）
const MIN_SCORE_DISPLAY = 0.5; // 表示する最小スコア

const PreferenceTrendsGraph: React.FC<PreferenceTrendsGraphProps> = ({
  userPreference,
}) => {
  // ユーザーの好みデータが存在しない場合は表示しない
  if (!userPreference || !userPreference.tagScores) {
    return null;
  }

  // タグスコアを降順にソートして上位7つを取得
  const topTags = useMemo(() => {
    return Object.entries(userPreference.tagScores)
      .filter(([_, score]) => score >= MIN_SCORE_DISPLAY) // 最小スコア以上のみ表示
      .sort((a, b) => b[1] - a[1]) // スコアの高い順にソート
      .slice(0, 7); // 上位7つのみ取得
  }, [userPreference.tagScores]);

  // 表示するものがない場合
  if (topTags.length === 0) {
    return null;
  }

  // 最大スコアを取得（バーの相対的な幅を計算するため）
  const maxScore = topTags[0][1];

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold mb-3 px-4">あなたの嗜好傾向</Text>
      <View className="px-4">
        {topTags.map(([tag, score], index) => {
          // スコアの相対値に基づいて幅を計算
          const relativeScore = score / maxScore;
          const barWidth = BAR_MAX_WIDTH * relativeScore;
          
          // 交互に異なる色を適用
          const isEven = index % 2 === 0;
          const barColor = isEven ? 'bg-blue-500' : 'bg-indigo-500';
          
          return (
            <View key={tag} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-700">{tag}</Text>
                <Text className="text-xs text-gray-500">
                  {score.toFixed(1)}
                </Text>
              </View>
              <View className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <View
                  className={`h-full ${barColor} rounded-full`}
                  style={{ width: barWidth }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text className="text-xs text-gray-500 mt-2 px-4">
        ※ スワイプの履歴からあなたの好みを分析しています
      </Text>
    </View>
  );
};

export default PreferenceTrendsGraph;
