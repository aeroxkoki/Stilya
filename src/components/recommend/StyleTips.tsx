import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserPreference } from '@/types';

interface StyleTipsProps {
  userPreference: UserPreference;
  compact?: boolean;
}

const StyleTips: React.FC<StyleTipsProps> = ({
  userPreference,
  compact = false,
}) => {
  // ユーザーの好みデータが存在しない場合は表示しない
  if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
    return null;
  }

  const topTags = userPreference.topTags;

  // ユーザーの好みタグから、おすすめのスタイリングTipsを生成
  const styleTips = useMemo(() => {
    const tips: { title: string; description: string; icon: string }[] = [];

    // カジュアル系のタグがあるかチェック
    const hasCasualStyle = topTags.some(
      tag => ['カジュアル', 'ナチュラル', 'デイリー', 'シンプル'].includes(tag)
    );

    // モード系のタグがあるかチェック
    const hasModeStyle = topTags.some(
      tag => ['モード', 'モノトーン', '都会的', 'ミニマル', 'クール'].includes(tag)
    );

    // フェミニン系のタグがあるかチェック
    const hasFeminineStyle = topTags.some(
      tag => ['フェミニン', 'ガーリー', 'ロマンティック', 'スウィート'].includes(tag)
    );

    // ストリート系のタグがあるかチェック
    const hasStreetStyle = topTags.some(
      tag => ['ストリート', 'スポーティ', '個性的', 'ワイド'].includes(tag)
    );

    // タグに基づいてTipsを追加
    if (hasCasualStyle) {
      tips.push({
        title: 'シンプルさを大切に',
        description: 'ナチュラル素材のアイテムを中心に、着回しやすいベーシックカラーを選びましょう。',
        icon: 'shirt-outline',
      });
    }

    if (hasModeStyle) {
      tips.push({
        title: '洗練されたシルエット',
        description: '黒・白・グレーを基調に、シャープでクリーンなラインを意識したスタイリングがおすすめです。',
        icon: 'contrast-outline',
      });
    }

    if (hasFeminineStyle) {
      tips.push({
        title: '優しい色合いと素材感',
        description: 'パステルカラーやフリル、柔らかな素材でフェミニンな印象を引き立てましょう。',
        icon: 'flower-outline',
      });
    }

    if (hasStreetStyle) {
      tips.push({
        title: 'レイヤードで個性を',
        description: 'オーバーサイズのアイテムをレイヤードして、カジュアルながらも個性的なコーディネートに。',
        icon: 'layers-outline',
      });
    }

    // 一般的なTips（好みに関わらず表示）
    tips.push({
      title: 'トーンを揃える',
      description: '似た色調のアイテムを組み合わせると、統一感のあるコーディネートになります。',
      icon: 'color-palette-outline',
    });

    return tips.slice(0, 3); // 最大3つまで表示
  }, [topTags]);

  // コンパクト表示の場合
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTitle}>スタイリングTips</Text>
        {styleTips.map((tip, index) => (
          <View key={index} style={styles.compactTipItem}>
            <Ionicons name={tip.icon as any} size={16} color="#4B5563" style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={styles.compactTipText}>{tip.title}</Text>
          </View>
        ))}
      </View>
    );
  }

  // 通常表示の場合
  return (
    <View style={styles.container}>
      <Text style={styles.title}>あなたにぴったりなスタイリングTips</Text>
      <View style={styles.tipsContainer}>
        {styleTips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <View style={styles.tipHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={tip.icon as any} size={20} color="#3B82F6" />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  compactTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  compactTipText: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  tipDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default StyleTips;
