import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { UserPreference } from '../../types';

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
    if (!userPreference.tagScores) return [];
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
    <View style={styles.container}>
      <Text style={styles.title}>あなたの嗜好傾向</Text>
      <View style={styles.chartContainer}>
        {topTags.map(([tag, score], index) => {
          // スコアの相対値に基づいて幅を計算
          const relativeScore = score / maxScore;
          const barWidth = BAR_MAX_WIDTH * relativeScore;
          
          // 交互に異なる色を適用
          const isEven = index % 2 === 0;
          const barColor = isEven ? '#3B82F6' : '#6366F1';
          
          return (
            <View key={tag} style={styles.barRow}>
              <View style={styles.labelContainer}>
                <Text style={styles.tagLabel}>{tag}</Text>
                <Text style={styles.scoreLabel}>
                  {score.toFixed(1)}
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { width: barWidth, backgroundColor: barColor }
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.footnote}>
        ※ スワイプの履歴からあなたの好みを分析しています
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    marginVertical: 8,
  },
  barRow: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  barContainer: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  footnote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default PreferenceTrendsGraph;
