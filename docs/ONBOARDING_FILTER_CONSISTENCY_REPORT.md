# オンボーディング・フィルター・推薦システム整合性レポート

## 📋 概要
このレポートは、Stilyaアプリのオンボーディング画面、フィルター機能、推薦システムの整合性を分析し、改善点を提案するものです。

## 🔍 現状分析

### 1. オンボーディングで収集する情報
- **性別** (gender): male/female/other
- **スタイルの好み** (stylePreference): 複数選択可能
  - casual, street, mode, natural, classic, feminine
- **年齢層** (ageGroup): teens, twenties, thirties, forties, fifties_plus
- **スタイル診断結果** (styleQuizResults): スワイプによる好み学習

### 2. フィルター機能の構成
- **価格範囲** (priceRange): [0, 50000]
- **スタイル** (style): 単一選択（すべて/カジュアル/クラシック/ナチュラル/モード/ストリート/フェミニン）
- **気分タグ** (moods): 新着/人気/セール
- **中古品を含む** (includeUsed): true/false

### 3. 推薦システムの活用方法
- ユーザーのスワイプ履歴（swipes）を分析
- style_preferencesとタグのマッチング
- 価格帯の自動調整（平均価格の±50%）

## 🚨 発見された整合性の問題

### 問題1: スタイル選択の不整合
**オンボーディング**: 複数選択可能（配列）
**フィルター**: 単一選択のみ

**影響**: ユーザーが複数のスタイルを好む場合、フィルターで全てを反映できない

### 問題2: 性別情報の未活用
**収集**: オンボーディングで性別を収集
**活用**: フィルターや推薦で性別が考慮されていない

### 問題3: 年齢層情報の未活用
**収集**: オンボーディングで年齢層を収集
**活用**: 推薦やフィルタリングで年齢層が考慮されていない

### 問題4: スタイル診断結果の限定的な活用
**収集**: StyleQuizScreenでスワイプによる詳細な好み学習
**活用**: swipesテーブルに保存されるが、推薦への反映が限定的

## 💡 改善提案

### 1. フィルター機能の拡張
```typescript
// FilterContext.tsx の改修案
export interface FilterOptions {
  priceRange: [number, number];
  styles: string[];                    // 複数選択に変更
  moods: string[];
  includeUsed?: boolean;
  gender?: 'male' | 'female' | 'unisex' | 'all';  // 性別フィルター追加
  ageGroup?: string;                   // 年齢層フィルター追加
}
```

### 2. スマートフィルターの強化
```typescript
// smartFilterService.ts の改修案
export const getSmartDefaults = async (userId: string): Promise<FilterOptions> => {
  // 既存のロジックに加えて...
  
  // ユーザープロファイルから性別と年齢層を取得
  const { data: userData } = await supabase
    .from('users')
    .select('gender, age_group, style_preferences')
    .eq('id', userId)
    .single();
  
  return {
    priceRange: [minPrice, maxPrice],
    styles: userData?.style_preferences || [],  // 複数スタイル対応
    moods: suggestedMoods,
    includeUsed: true,
    gender: userData?.gender || 'all',
    ageGroup: userData?.age_group
  };
};
```

### 3. 推薦ロジックの改善
```typescript
// integratedRecommendationService.ts の改修案
export const getEnhancedRecommendations = async (
  userId: string,
  limit: number = 20,
  excludeIds: string[] = [],
  filters?: FilterOptions
): Promise<{...}> => {
  // 性別・年齢層を考慮した推薦ロジックを追加
  const userProfile = await getUserProfile(userId);
  
  // 複数スタイルに対応した商品フィルタリング
  if (filters?.styles && filters.styles.length > 0) {
    // スタイルのいずれかにマッチする商品を取得
  }
  
  // 性別に基づく商品フィルタリング
  if (filters?.gender && filters.gender !== 'all') {
    // 性別に適した商品を優先
  }
};
```

### 4. UI/UXの改善
- フィルターモーダルで複数スタイル選択を可能に
- 選択したスタイルをチップ形式で表示
- 性別・年齢層のクイックフィルターボタンを追加

## 📊 実装優先度

| 改善項目 | 優先度 | 想定工数 | 影響度 |
|---------|--------|----------|--------|
| スタイル複数選択対応 | 高 | 4時間 | 大 |
| 性別フィルター追加 | 中 | 2時間 | 中 |
| 年齢層フィルター追加 | 低 | 2時間 | 小 |
| 診断結果の活用強化 | 高 | 6時間 | 大 |

## 🔧 実装手順

1. **Phase 1**: FilterContextの拡張（スタイル複数選択対応）
2. **Phase 2**: スマートフィルターサービスの改修
3. **Phase 3**: 推薦サービスの改修
4. **Phase 4**: UIコンポーネントの更新
5. **Phase 5**: テストとデバッグ

## 📝 まとめ
現在のシステムは基本的な機能は実装されていますが、オンボーディングで収集した貴重な情報が十分に活用されていません。特に、複数スタイルの選択と性別情報の活用は、ユーザー体験を大きく向上させる可能性があります。

これらの改善により、よりパーソナライズされた商品推薦が可能になり、ユーザーの満足度向上が期待できます。
