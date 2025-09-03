// 年代グループの定義（統一フォーマット）
// UI表示用: '10-19', '20-29' など
// 内部処理用: 'teens', 'twenties' など

export type AgeGroupDisplay = '10-19' | '20-29' | '30-39' | '40-49' | '50+';
export type AgeGroupInternal = 'teens' | 'twenties' | 'thirties' | 'forties' | 'fifties_plus';

export const AGE_GROUP_MAPPING: Record<AgeGroupDisplay, AgeGroupInternal> = {
  '10-19': 'teens',
  '20-29': 'twenties',
  '30-39': 'thirties',
  '40-49': 'forties',
  '50+': 'fifties_plus',
};

export const AGE_GROUP_REVERSE_MAPPING: Record<AgeGroupInternal, AgeGroupDisplay> = {
  teens: '10-19',
  twenties: '20-29',
  thirties: '30-39',
  forties: '40-49',
  fifties_plus: '50+',
};

export const AGE_GROUP_LABELS: Record<AgeGroupDisplay, string> = {
  '10-19': '10代',
  '20-29': '20代',
  '30-39': '30代',
  '40-49': '40代',
  '50+': '50代以上',
};

// 変換ヘルパー関数
export function convertToInternalAgeGroup(displayAge?: AgeGroupDisplay | string): AgeGroupInternal | undefined {
  if (!displayAge) return undefined;
  
  // 既に内部形式の場合はそのまま返す
  if (['teens', 'twenties', 'thirties', 'forties', 'fifties_plus'].includes(displayAge)) {
    return displayAge as AgeGroupInternal;
  }
  
  // 表示形式から内部形式へ変換
  return AGE_GROUP_MAPPING[displayAge as AgeGroupDisplay];
}

export function convertToDisplayAgeGroup(internalAge?: AgeGroupInternal | string): AgeGroupDisplay | undefined {
  if (!internalAge) return undefined;
  
  // 既に表示形式の場合はそのまま返す
  if (['10-19', '20-29', '30-39', '40-49', '50+'].includes(internalAge)) {
    return internalAge as AgeGroupDisplay;
  }
  
  // 内部形式から表示形式へ変換
  return AGE_GROUP_REVERSE_MAPPING[internalAge as AgeGroupInternal];
}
