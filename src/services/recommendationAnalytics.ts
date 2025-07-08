import { supabase, TABLES } from './supabase';

export interface RecommendationMetrics {
  userId: string;
  recommendationType: string;
  productId: string;
  position: number;
  wasSwiped?: boolean;
  swipeResult?: 'yes' | 'no';
  clickThrough?: boolean;
  sessionId?: string;
}

export const trackRecommendationMetrics = async (
  metrics: RecommendationMetrics
): Promise<void> => {
  try {
    await supabase
      .from('recommendation_effectiveness')
      .insert({
        user_id: metrics.userId,
        recommendation_type: metrics.recommendationType,
        product_id: metrics.productId,
        position: metrics.position,
        was_swiped: metrics.wasSwiped || false,
        swipe_result: metrics.swipeResult,
        click_through: metrics.clickThrough || false,
        session_id: metrics.sessionId,
      });
  } catch (error) {
    console.error('Error tracking recommendation metrics:', error);
  }
};

export const getRecommendationPerformance = async (
  startDate: Date,
  endDate: Date
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('recommendation_effectiveness')
      .select(`
        recommendation_type,
        count(*) as total_impressions,
        sum(case when was_swiped then 1 else 0 end) as swipe_count,
        sum(case when swipe_result = 'yes' then 1 else 0 end) as yes_count,
        sum(case when click_through then 1 else 0 end) as click_count
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting recommendation performance:', error);
    return null;
  }
};
