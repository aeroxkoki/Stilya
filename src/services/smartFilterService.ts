import { supabase } from './supabase';
import { FilterOptions } from '@/contexts/FilterContext';
import { STYLE_ID_TO_JP_TAG } from '@/constants/constants';

/**
 * ユーザーの過去の行動履歴から、スマートなデフォルトフィルター値を生成する
 * 
 * @param userId ユーザーID
 * @returns スマートデフォルトのフィルターオプション
 */
export const getSmartDefaults = async (userId: string): Promise<FilterOptions> => {
  try {
    console.log('[SmartFilterService] Getting smart defaults for user:', userId);
    
    // ユーザーのプロファイルを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('style_preferences')
      .eq('id', userId)
      .single();
    
    // 1. 過去30日のスワイプ履歴から平均価格を計算
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Yesスワイプされた商品の平均価格を取得
    const { data: yesSwipes, error: swipeError } = await supabase
      .from('swipes')
      .select(`
        product_id,
        external_products!inner(price)
      `)
      .eq('user_id', userId)
      .eq('result', 'yes')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(100);
    
    if (swipeError) {
      console.error('[SmartFilterService] Error fetching swipe history:', swipeError);
      return getDefaultFilters();
    }
    
    // 平均価格を計算
    let averagePrice = 10000; // デフォルト
    if (yesSwipes && yesSwipes.length > 0) {
      const prices = yesSwipes
        .map(swipe => swipe.external_products?.price)
        .filter((price): price is number => price !== null && price !== undefined);
      
      if (prices.length > 0) {
        const sum = prices.reduce((acc, price) => acc + price, 0);
        averagePrice = Math.round(sum / prices.length);
      }
    }
    
    // 価格帯を決定（平均価格の±50%）
    const minPrice = Math.max(0, Math.round(averagePrice * 0.5));
    const maxPrice = Math.min(50000, Math.round(averagePrice * 1.5));
    
    // 2. 最も「Yes」スワイプされたスタイルタグを特定
    const { data: tagData, error: tagError } = await supabase
      .from('swipes')
      .select(`
        external_products!inner(tags)
      `)
      .eq('user_id', userId)
      .eq('result', 'yes')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .limit(100);
    
    let topStyle = 'すべて';
    
    // ユーザーのプロファイルにスタイル選択がある場合、それを優先
    if (!userError && userData && userData.style_preferences && userData.style_preferences.length > 0) {
      const firstStyleId = userData.style_preferences[0];
      const jpTag = STYLE_ID_TO_JP_TAG[firstStyleId];
      if (jpTag) {
        topStyle = jpTag;
      }
    }
    
    // スワイプ履歴からもスタイルを分析
    if (!tagError && tagData && tagData.length > 0) {
      // タグの出現回数をカウント
      const tagCounts: Record<string, number> = {};
      const styleOptions = ['カジュアル', 'きれいめ', 'ナチュラル', 'モード', 'ストリート', 'フェミニン'];
      
      tagData.forEach(item => {
        const tags = item.external_products?.tags || [];
        tags.forEach((tag: string) => {
          if (styleOptions.includes(tag)) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      });
      
      // 最も多いスタイルを選択
      const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);
      if (sortedTags.length > 0 && sortedTags[0][1] >= 3) { // 3回以上出現したら採用
        topStyle = sortedTags[0][0];
      }
    }
    
    // 3. 現在時刻に基づいて気分タグを提案
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const suggestedMoods: string[] = [];
    
    // 時間帯による提案
    if (currentHour >= 19 || currentHour < 2) {
      // 夜：リラックスタイムなので新着をチェック
      suggestedMoods.push('新着');
    } else if (currentHour >= 12 && currentHour < 14) {
      // 昼休み：人気商品をチェック
      suggestedMoods.push('人気');
    }
    
    // 週末はセール情報を提案
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      suggestedMoods.push('セール');
    }
    
    // 最近のアクティビティがあれば新着を追加
    if (!suggestedMoods.includes('新着') && yesSwipes && yesSwipes.length > 5) {
      suggestedMoods.push('新着');
    }
    
    console.log('[SmartFilterService] Smart defaults calculated:', {
      priceRange: [minPrice, maxPrice],
      style: topStyle,
      moods: suggestedMoods
    });
    
    return {
      priceRange: [minPrice, maxPrice],
      style: topStyle,
      moods: suggestedMoods
    };
    
  } catch (error) {
    console.error('[SmartFilterService] Error calculating smart defaults:', error);
    return getDefaultFilters();
  }
};

/**
 * デフォルトのフィルター設定を返す
 */
const getDefaultFilters = (): FilterOptions => {
  return {
    priceRange: [0, 50000],
    style: 'すべて',
    moods: []
  };
};
