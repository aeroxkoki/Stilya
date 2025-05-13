import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type TagsProps = {
  tags: string[];
  limit?: number;
  size?: 'small' | 'medium' | 'large';
  colorMap?: Record<string, string>;
};

/**
 * タグを表示するコンポーネント
 * カテゴリごとに異なる色を設定可能
 */
const Tags: React.FC<TagsProps> = ({
  tags,
  limit = 4,
  size = 'medium',
  colorMap,
}) => {
  // サイズごとのスタイル
  const sizeStyles = {
    small: {
      container: { gap: 4 },
      tag: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 8 },
      text: { fontSize: 10 },
    },
    medium: {
      container: { gap: 6 },
      tag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
      text: { fontSize: 12 },
    },
    large: {
      container: { gap: 8 },
      tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
      text: { fontSize: 14 },
    },
  };

  // タグの色を決定（colorMapが指定されていない場合はデフォルト色を使用）
  const getTagColor = (tag: string): string => {
    if (colorMap && colorMap[tag]) {
      return colorMap[tag];
    }

    // デフォルトの色マッピング
    const defaultColors: Record<string, string> = {
      // 季節
      '春': '#4ade80', // グリーン
      '夏': '#22d3ee', // シアン
      '秋': '#f97316', // オレンジ
      '冬': '#93c5fd', // ライトブルー
      
      // スタイル
      'カジュアル': '#a78bfa', // パープル
      'フォーマル': '#1e293b', // ダークグレー
      'モード': '#18181b', // ブラック
      'ストリート': '#6366f1', // インディゴ
      'ナチュラル': '#84cc16', // ライム
      
      // 性別
      'メンズ': '#0ea5e9', // スカイブルー
      'レディース': '#ec4899', // ピンク
      'ユニセックス': '#8b5cf6', // バイオレット
    };

    return defaultColors[tag] || '#64748b'; // 既定値はスレートグレー
  };

  // 表示するタグを制限
  const displayTags = tags.slice(0, limit);

  return (
    <View style={[styles.container, sizeStyles[size].container]}>
      {displayTags.map((tag, index) => (
        <View
          key={index}
          style={[
            styles.tag,
            sizeStyles[size].tag,
            { backgroundColor: getTagColor(tag) + '33' }, // 色に透明度を追加（33=20%）
            { borderColor: getTagColor(tag) + '66' }, // 濃いめのボーダー（66=40%）
          ]}
        >
          <Text
            style={[
              styles.text,
              sizeStyles[size].text,
              { color: getTagColor(tag) },
            ]}
            numberOfLines={1}
          >
            {tag}
          </Text>
        </View>
      ))}
      
      {/* タグが制限を超えている場合に「+N」を表示 */}
      {tags.length > limit && (
        <View
          style={[
            styles.tag,
            sizeStyles[size].tag,
            { backgroundColor: '#f1f5f9' },
          ]}
        >
          <Text
            style={[
              styles.text,
              sizeStyles[size].text,
              { color: '#64748b' },
            ]}
          >
            +{tags.length - limit}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1,
    marginRight: 4,
    marginBottom: 4,
  },
  text: {
    fontWeight: '500',
  },
});

export default Tags;