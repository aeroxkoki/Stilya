import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface TagsProps {
  tags: string[];
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  onPressTag?: (tag: string) => void;
  scrollable?: boolean;
  maxTags?: number;
}

const Tags: React.FC<TagsProps> = ({
  tags,
  size = 'medium',
  color = 'white',
  backgroundColor = 'rgba(59, 130, 246, 0.8)', // #3B82F6 with opacity
  onPressTag,
  scrollable = true,
  maxTags = 5,
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  // サイズに応じたスタイルを選択
  const sizeStyles = {
    small: {
      text: styles.smallText,
      tag: styles.smallTag,
    },
    medium: {
      text: styles.mediumText,
      tag: styles.mediumTag,
    },
    large: {
      text: styles.largeText,
      tag: styles.largeTag,
    },
  };

  // 色指定を適用
  const colorStyle = {
    color,
  };

  // 背景色指定を適用
  const backgroundColorStyle = {
    backgroundColor,
  };

  // 表示するタグを制限
  const visibleTags = maxTags > 0 ? tags.slice(0, maxTags) : tags;
  const hiddenTagsCount = maxTags > 0 ? Math.max(0, tags.length - maxTags) : 0;

  // タグコンポーネント
  const TagComponent = ({ tag }: { tag: string }) => (
    <View
      style={[sizeStyles[size].tag, backgroundColorStyle]}
      key={tag}
    >
      <Text
        style={[sizeStyles[size].text, colorStyle]}
        numberOfLines={1}
      >
        {tag}
      </Text>
    </View>
  );

  // コンテンツ
  const content = (
    <>
      {visibleTags.map(tag => (
        <TagComponent tag={tag} key={tag} />
      ))}
      
      {hiddenTagsCount > 0 && (
        <View style={[sizeStyles[size].tag, styles.moreTag]}>
          <Text style={[sizeStyles[size].text, styles.moreTagText]}>
            +{hiddenTagsCount}
          </Text>
        </View>
      )}
    </>
  );

  // スクロール可能かどうかで表示方法を変える
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  smallTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  mediumTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  largeTag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 10,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '500',
  },
  largeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreTag: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)', // #6B7280 with opacity
  },
  moreTagText: {
    color: 'white',
  },
});

export default Tags;
