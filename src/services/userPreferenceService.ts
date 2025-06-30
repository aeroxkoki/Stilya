import { supabase } from './supabase';

export class UserPreferenceService {
  // スワイプ結果をリアルタイムで反映
  static async updatePreferenceFromSwipe(
    userId: string,
    productId: string,
    result: 'yes' | 'no',
    swipeTimeMs?: number
  ) {
    try {
      // 商品情報を取得
      const { data: product } = await supabase
        .from('external_products')
        .select('tags, category, brand, price')
        .eq('id', productId)
        .single();
      
      if (!product) return;
      
      // ユーザーのメタデータを取得
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata || {};
      
      // タグスコアを更新
      const tagScores = metadata.tag_scores || {};
      const weight = swipeTimeMs && swipeTimeMs < 1000 ? 0.5 : 1.0;
      
      product.tags?.forEach((tag: string) => {
        const currentScore = tagScores[tag] || 0;
        const change = result === 'yes' ? weight : -weight * 0.5;
        tagScores[tag] = currentScore + change;
      });
      
      // 短期嗜好を記録（直近30スワイプ）
      const recentSwipes = metadata.recent_swipes || [];
      recentSwipes.push({
        productId,
        result,
        tags: product.tags,
        timestamp: new Date().toISOString()
      });
      
      // 30件を超えたら古いものを削除
      if (recentSwipes.length > 30) {
        recentSwipes.shift();
      }
      
      // メタデータを更新
      await supabase.auth.updateUser({
        data: {
          tag_scores: tagScores,
          recent_swipes: recentSwipes
        }
      });
      
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  }
  
  // 短期的なトレンドを分析
  static async getShortTermTrends(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const recentSwipes = user?.user_metadata?.recent_swipes || [];
    
    // 直近のスワイプからトレンドを分析
    const recentYesTags: Record<string, number> = {};
    
    recentSwipes
      .filter((swipe: any) => swipe.result === 'yes')
      .slice(-10) // 直近10件のYes
      .forEach((swipe: any) => {
        swipe.tags?.forEach((tag: string) => {
          recentYesTags[tag] = (recentYesTags[tag] || 0) + 1;
        });
      });
    
    // スコアが高い順にソート
    return Object.entries(recentYesTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }
}
