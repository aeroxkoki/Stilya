/**
 * カテゴリーマッピング
 * フィルターUIの英語表記とデータベースの日本語タグを対応付ける
 */

// フィルターカテゴリー（英語）から日本語タグへのマッピング
export const CATEGORY_TO_TAGS: Record<string, string[]> = {
  'ec-brand': ['ECブランド', 'EC限定', 'オンライン限定'],
  'office': ['オフィス', 'ビジネス', 'フォーマル', 'クラシック'],
  'select': ['セレクト', 'セレクトショップ'],
  'lifestyle': ['ライフスタイル', 'デイリー', '日常着'],
  'basic': ['ベーシック', 'シンプル', '定番'],
  'trend': ['トレンド', '流行', '今季'],
  'high-brand': ['ハイブランド', 'ラグジュアリー', '高級'],
  'fast-fashion': ['ファストファッション', 'プチプラ', 'お手頃']
};

// 逆引き用マッピング（必要に応じて使用）
export const TAG_TO_CATEGORY: Record<string, string> = {};
Object.entries(CATEGORY_TO_TAGS).forEach(([category, tags]) => {
  tags.forEach(tag => {
    TAG_TO_CATEGORY[tag] = category;
  });
});

/**
 * カテゴリーフィルターを日本語タグの配列に変換
 */
export const convertCategoriesToTags = (categories: string[]): string[] => {
  const tags: string[] = [];
  categories.forEach(category => {
    const mappedTags = CATEGORY_TO_TAGS[category];
    if (mappedTags) {
      tags.push(...mappedTags);
    }
  });
  return [...new Set(tags)]; // 重複を除去
};

/**
 * データベースのタグがカテゴリーに該当するかチェック
 */
export const productMatchesCategories = (productTags: string[], filterCategories: string[]): boolean => {
  if (!filterCategories || filterCategories.length === 0) return true;
  
  const filterTags = convertCategoriesToTags(filterCategories);
  
  // productTagsのいずれかがfilterTagsに含まれていればtrue
  return productTags.some(tag => filterTags.includes(tag));
};
