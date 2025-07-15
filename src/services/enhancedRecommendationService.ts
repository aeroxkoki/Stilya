import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { Product, UserPreference, EnhancedUserPreference, SessionSwipe } from '../types';
import { normalizeProduct } from './productService';
import { addScoreNoise, shuffleArray } from '../utils/randomUtils';

// React Native環境でcrypto.randomUUIDが利用できない場合の代替
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// セッション管理用のメモリストレージ
const sessionStorage = new Map<string, SessionSwipe[]>();

/**
 * Enhanced Recommendation Service
 * 既存のrecommendationServiceを拡張し、より高度な推薦機能を提供
 */
export class EnhancedRecommendationService {
  
  /**
   * ユーザーの詳細な好み分析を実行
   */
  static async analyzeUserPreferencesEnhanced(userId: string): Promise<{
    success: boolean;
    data?: EnhancedUserPreference;
    error?: string;
  }> {
    try {
      // 基本的な分析結果を取得（既存のrecommendationServiceから）
      const { RecommendationService } = await import('./recommendationService');
      const baseResult = await RecommendationService.analyzeUserPreferences(userId);
      
      if (!baseResult.success || !baseResult.data) {
        return baseResult;
      }
      
      const basePreference = baseResult.data;
      
      // 追加の分析を実行
      const enhancedAnalysis = await this.performEnhancedAnalysis(userId, basePreference);
      
      // EnhancedUserPreferenceを構築
      const enhancedPreference: EnhancedUserPreference = {
        ...basePreference,
        ...enhancedAnalysis,
      };
      
      // データベースに保存
      await this.saveEnhancedPreferences(userId, enhancedPreference);
      
      return handleSupabaseSuccess(enhancedPreference);
    } catch (error) {
      console.error('[analyzeUserPreferencesEnhanced] Error:', error);
      return handleSupabaseError(error as Error);
    }
  }
  
  /**
   * 詳細な分析を実行
   */
  private static async performEnhancedAnalysis(
    userId: string, 
    basePreference: UserPreference
  ): Promise<Partial<EnhancedUserPreference>> {
    // スワイプデータを取得
    const { data: swipes, error } = await supabase
      .from(TABLES.SWIPES)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (error || !swipes) {
      console.error('[performEnhancedAnalysis] Error fetching swipes:', error);
      return {};
    }
    
    // スタイルパターンの分析
    const stylePatterns = this.analyzeStylePatterns(basePreference.likedTags);
    
    // カラー嗜好の分析
    const colorPreferences = this.analyzeColorPreferences(basePreference.likedTags);
    
    // 価格感度の分析
    const priceSensitivity = this.analyzePriceSensitivity(
      basePreference.avgPriceRange,
      swipes.length
    );
    
    // ブランドロイヤリティの分析
    const brandLoyalty = this.analyzeBrandLoyalty(
      basePreference.brands || [],
      basePreference.dislikedBrands || []
    );
    
    // 平均反応時間の計算
    const avgResponseTime = this.calculateAvgResponseTime(swipes);
    
    return {
      stylePatterns,
      colorPreferences,
      priceSensitivity,
      brandLoyalty,
      totalSwipes: swipes.length,
      avgResponseTime,
    };
  }
  
  /**
   * スタイルパターンの分析
   */
  private static analyzeStylePatterns(likedTags: string[]): Record<string, number> {
    const styleKeywords = {
      casual: ['カジュアル', 'リラックス', 'デイリー', 'ベーシック'],
      formal: ['フォーマル', 'ビジネス', 'オフィス', 'クラシック'],
      street: ['ストリート', 'スポーティ', 'アスレジャー', 'スニーカー'],
      elegant: ['エレガント', 'フェミニン', 'ガーリー', '上品'],
      mode: ['モード', 'アバンギャルド', 'デザイナー', 'コレクション'],
      natural: ['ナチュラル', 'オーガニック', 'シンプル', 'ミニマル'],
    };
    
    const patterns: Record<string, number> = {};
    
    Object.entries(styleKeywords).forEach(([style, keywords]) => {
      const score = likedTags.filter(tag =>
        keywords.some(keyword => tag.includes(keyword))
      ).length;
      
      if (score > 0) {
        patterns[style] = score / likedTags.length;
      }
    });
    
    return patterns;
  }
  
  /**
   * カラー嗜好の分析
   */
  private static analyzeColorPreferences(likedTags: string[]): Record<string, number> {
    const colorKeywords = {
      monochrome: ['ブラック', 'ホワイト', 'グレー', 'モノトーン'],
      earth: ['ベージュ', 'ブラウン', 'カーキ', 'オリーブ'],
      pastel: ['パステル', 'ピンク', 'ライトブルー', 'ラベンダー'],
      vivid: ['レッド', 'ブルー', 'イエロー', 'オレンジ', 'グリーン'],
      navy: ['ネイビー', '紺', 'インディゴ', 'デニム'],
    };
    
    const preferences: Record<string, number> = {};
    
    Object.entries(colorKeywords).forEach(([colorGroup, keywords]) => {
      const score = likedTags.filter(tag =>
        keywords.some(keyword => tag.includes(keyword))
      ).length;
      
      if (score > 0) {
        preferences[colorGroup] = score / Math.max(likedTags.length, 1);
      }
    });
    
    return preferences;
  }
  
  /**
   * 価格感度の分析
   */
  private static analyzePriceSensitivity(
    priceRange: { min: number; max: number },
    totalSwipes: number
  ): {
    preferredRange: { min: number; max: number };
    sensitivity: number;
  } {
    const range = priceRange.max - priceRange.min;
    const avgPrice = (priceRange.min + priceRange.max) / 2;
    
    // 価格帯の幅から感度を計算（狭いほど感度が高い）
    let sensitivity = 0.5;
    if (range < 5000) {
      sensitivity = 0.9;
    } else if (range < 10000) {
      sensitivity = 0.7;
    } else if (range < 20000) {
      sensitivity = 0.5;
    } else {
      sensitivity = 0.3;
    }
    
    // スワイプ数が多いほど価格感度が明確になる
    if (totalSwipes > 100) {
      sensitivity = Math.min(sensitivity * 1.2, 1.0);
    }
    
    return {
      preferredRange: priceRange,
      sensitivity,
    };
  }
  
  /**
   * ブランドロイヤリティの分析
   */
  private static analyzeBrandLoyalty(
    preferredBrands: string[],
    dislikedBrands: string[]
  ): {
    loyaltyScore: number;
    topBrands: string[];
  } {
    const totalBrands = preferredBrands.length + dislikedBrands.length;
    
    // ロイヤリティスコアは好きなブランドの割合
    const loyaltyScore = totalBrands > 0 
      ? preferredBrands.length / totalBrands 
      : 0.5;
    
    return {
      loyaltyScore,
      topBrands: preferredBrands.slice(0, 5),
    };
  }
  
  /**
   * 平均反応時間の計算
   */
  private static calculateAvgResponseTime(swipes: any[]): number {
    const validSwipes = swipes.filter(s => s.swipe_time_ms && s.swipe_time_ms > 0);
    
    if (validSwipes.length === 0) {
      return 3000; // デフォルト3秒
    }
    
    const totalTime = validSwipes.reduce((sum, s) => sum + s.swipe_time_ms, 0);
    return Math.round(totalTime / validSwipes.length);
  }
  
  /**
   * 拡張された好み情報を保存
   */
  private static async saveEnhancedPreferences(
    userId: string,
    preferences: EnhancedUserPreference
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preference_analysis')
        .upsert({
          user_id: userId,
          style_patterns: preferences.stylePatterns || {},
          color_preferences: preferences.colorPreferences || {},
          price_sensitivity: preferences.priceSensitivity || {},
          brand_loyalty: preferences.brandLoyalty || {},
          total_swipes: preferences.totalSwipes || 0,
          avg_response_time_ms: preferences.avgResponseTime,
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error('[saveEnhancedPreferences] Error:', error);
      }
    } catch (error) {
      console.error('[saveEnhancedPreferences] Exception:', error);
    }
  }
  
  /**
   * Enhanced Recommendations with Advanced Scoring
   */
  static async getEnhancedRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<{ success: boolean; data?: Product[]; error?: string }> {
    try {
      // 拡張された好み分析を取得
      const preferenceResult = await this.analyzeUserPreferencesEnhanced(userId);
      
      if (!preferenceResult.success || !preferenceResult.data) {
        // フォールバック: 基本的な推薦に切り替え
        const { RecommendationService } = await import('./recommendationService');
        return await RecommendationService.getPopularProducts(limit);
      }
      
      const preferences = preferenceResult.data;
      
      // 商品プールを取得（多めに取得して多様性を確保）
      const poolSize = limit * 10;
      const products = await this.fetchProductPool(preferences, poolSize);
      
      if (!products || products.length === 0) {
        return handleSupabaseSuccess([]);
      }
      
      // スワイプ済み商品を除外
      const filteredProducts = await this.filterSwipedProducts(userId, products);
      
      // 高度なスコアリング
      const scoredProducts = await this.scoreProductsEnhanced(filteredProducts, preferences);
      
      // 多様性を考慮した選択
      const diverseProducts = this.ensureEnhancedDiversity(scoredProducts, limit);
      
      // スコアプロパティを削除して返す
      const recommendations = diverseProducts.map(({ score, ...product }) => 
        normalizeProduct(product)
      );
      
      return handleSupabaseSuccess(recommendations);
    } catch (error) {
      console.error('[getEnhancedRecommendations] Error:', error);
      return handleSupabaseError(error as Error);
    }
  }
  
  /**
   * 商品プールを取得
   */
  private static async fetchProductPool(
    preferences: EnhancedUserPreference,
    poolSize: number
  ): Promise<Product[]> {
    try {
      let query = supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .eq('is_active', true);
      
      // ネガティブフィルタリング
      if (preferences.dislikedBrands && preferences.dislikedBrands.length > 0) {
        query = query.not('brand', 'in', `(${preferences.dislikedBrands.join(',')})`);
      }
      
      // 価格帯フィルタリング（感度が高い場合）
      if (preferences.priceSensitivity && preferences.priceSensitivity.sensitivity > 0.7) {
        const range = preferences.priceSensitivity.preferredRange;
        const buffer = (range.max - range.min) * 0.3; // 30%のバッファ
        query = query
          .gte('price', range.min - buffer)
          .lte('price', range.max + buffer);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(poolSize);
      
      if (error) {
        console.error('[fetchProductPool] Error:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('[fetchProductPool] Exception:', error);
      return [];
    }
  }
  
  /**
   * スワイプ済み商品をフィルタリング
   */
  private static async filterSwipedProducts(
    userId: string,
    products: Product[]
  ): Promise<Product[]> {
    try {
      const { data: swipes, error } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('[filterSwipedProducts] Error:', error);
        return products;
      }
      
      const swipedIds = new Set(swipes?.map(s => s.product_id) || []);
      return products.filter(p => !swipedIds.has(p.id));
    } catch (error) {
      console.error('[filterSwipedProducts] Exception:', error);
      return products;
    }
  }
  
  /**
   * 高度なスコアリング
   */
  private static async scoreProductsEnhanced(
    products: Product[],
    preferences: EnhancedUserPreference
  ): Promise<Array<Product & { score: number }>> {
    return products.map(product => {
      let score = 0;
      const tags = product.tags || [];
      
      // 基本的なタグマッチングスコア
      if (preferences.tagScores) {
        const tagScore = tags.reduce((sum, tag) => {
          return sum + (preferences.tagScores?.[tag] || 0);
        }, 0) / Math.max(tags.length, 1);
        score += tagScore * 2.0;
      }
      
      // スタイルパターンマッチング
      if (preferences.stylePatterns) {
        Object.entries(preferences.stylePatterns).forEach(([style, weight]) => {
          if (tags.some(tag => tag.toLowerCase().includes(style))) {
            score += weight * 1.5;
          }
        });
      }
      
      // カラー嗜好マッチング
      if (preferences.colorPreferences) {
        Object.entries(preferences.colorPreferences).forEach(([color, weight]) => {
          if (tags.some(tag => tag.includes(color))) {
            score += weight * 1.2;
          }
        });
      }
      
      // 価格適合度
      if (preferences.priceSensitivity && product.price) {
        const range = preferences.priceSensitivity.preferredRange;
        const center = (range.min + range.max) / 2;
        const deviation = Math.abs(product.price - center) / center;
        const priceScore = Math.exp(-deviation * preferences.priceSensitivity.sensitivity);
        score += priceScore * 1.5;
      }
      
      // ブランドロイヤリティ
      if (preferences.brandLoyalty && product.brand) {
        if (preferences.brandLoyalty.topBrands.includes(product.brand)) {
          score += preferences.brandLoyalty.loyaltyScore * 2.0;
        }
      }
      
      // ネガティブシグナルの減点
      const negativeScore = this.calculateNegativeSignals(product, preferences);
      score *= (1 - negativeScore);
      
      // 季節性ボーナス
      const seasonalBonus = this.calculateSeasonalBonus(product);
      score *= seasonalBonus;
      
      // ランダム性を追加
      score = addScoreNoise(score, 0.2);
      
      return { ...product, score };
    }).sort((a, b) => b.score - a.score);
  }
  
  /**
   * ネガティブシグナルの計算
   */
  private static calculateNegativeSignals(
    product: Product,
    preferences: EnhancedUserPreference
  ): number {
    let negativeScore = 0;
    const tags = product.tags || [];
    
    // 嫌いなタグ
    if (preferences.dislikedTags) {
      const matchedDislikedTags = tags.filter(tag => 
        preferences.dislikedTags?.includes(tag)
      );
      negativeScore += matchedDislikedTags.length * 0.3;
    }
    
    // 嫌いなカテゴリ
    if (preferences.dislikedCategories && product.category) {
      if (preferences.dislikedCategories.includes(product.category)) {
        negativeScore += 0.4;
      }
    }
    
    return Math.min(negativeScore, 0.8); // 最大80%減点
  }
  
  /**
   * 季節性ボーナスの計算
   */
  private static calculateSeasonalBonus(product: Product): number {
    const month = new Date().getMonth() + 1;
    const tags = product.tags || [];
    
    // 現在の季節を判定
    const currentSeason = 
      month >= 3 && month <= 5 ? '春' :
      month >= 6 && month <= 8 ? '夏' :
      month >= 9 && month <= 11 ? '秋' :
      '冬';
    
    // 季節タグマッチング
    if (tags.includes(currentSeason) || tags.includes(`${currentSeason}物`)) {
      return 1.5;
    }
    
    // オールシーズン商品
    if (tags.includes('オールシーズン') || tags.includes('通年')) {
      return 1.2;
    }
    
    return 1.0;
  }
  
  /**
   * 拡張された多様性確保
   */
  private static ensureEnhancedDiversity(
    scoredProducts: Array<Product & { score: number }>,
    limit: number
  ): Array<Product & { score: number }> {
    const selected: Array<Product & { score: number }> = [];
    const usedCategories = new Map<string, number>();
    const usedBrands = new Map<string, number>();
    const usedPriceRanges = new Map<string, number>();
    
    for (const product of scoredProducts) {
      if (selected.length >= limit) break;
      
      // カテゴリの多様性チェック
      const categoryCount = usedCategories.get(product.category || '') || 0;
      if (categoryCount >= 3) continue;
      
      // ブランドの多様性チェック
      const brandCount = usedBrands.get(product.brand || '') || 0;
      if (brandCount >= 2) continue;
      
      // 価格帯の多様性チェック
      const priceRange = this.getPriceRange(product.price || 0);
      const priceRangeCount = usedPriceRanges.get(priceRange) || 0;
      if (priceRangeCount >= 3) continue;
      
      // 選択
      selected.push(product);
      
      // カウントを更新
      usedCategories.set(product.category || '', categoryCount + 1);
      usedBrands.set(product.brand || '', brandCount + 1);
      usedPriceRanges.set(priceRange, priceRangeCount + 1);
    }
    
    // 不足分を補充
    if (selected.length < limit) {
      const remaining = scoredProducts
        .filter(p => !selected.includes(p))
        .slice(0, limit - selected.length);
      selected.push(...remaining);
    }
    
    return selected;
  }
  
  /**
   * 価格帯を判定
   */
  private static getPriceRange(price: number): string {
    if (price < 3000) return 'low';
    if (price < 10000) return 'medium';
    if (price < 30000) return 'high';
    return 'premium';
  }
  
  /**
   * セッション学習の更新
   */
  static async updateSessionLearning(
    userId: string,
    swipe: Omit<SessionSwipe, 'timestamp'>
  ): Promise<void> {
    try {
      // メモリに保存
      const userSessions = sessionStorage.get(userId) || [];
      userSessions.push({
        ...swipe,
        timestamp: new Date(),
      });
      
      // 最新20件のみ保持
      if (userSessions.length > 20) {
        userSessions.shift();
      }
      
      sessionStorage.set(userId, userSessions);
      
      // データベースにも保存
      const { error } = await supabase
        .from('user_session_learning')
        .insert({
          user_id: userId,
          session_id: generateUUID(),
          product_id: swipe.productId,
          result: swipe.result,
          response_time_ms: swipe.responseTime,
          session_position: userSessions.length,
        });
      
      if (error) {
        console.error('[updateSessionLearning] Error:', error);
      }
      
      // セッションパターンの分析（3件ごと）
      if (userSessions.length % 3 === 0) {
        await this.analyzeSessionPatterns(userId, userSessions);
      }
    } catch (error) {
      console.error('[updateSessionLearning] Exception:', error);
    }
  }
  
  /**
   * セッションパターンの分析
   */
  private static async analyzeSessionPatterns(
    userId: string,
    sessions: SessionSwipe[]
  ): Promise<void> {
    try {
      // 最近の傾向を分析
      const recentSessions = sessions.slice(-10);
      const yesRate = recentSessions.filter(s => s.result === 'yes').length / recentSessions.length;
      const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.responseTime, 0) / recentSessions.length;
      
      // パターンを検出
      const patterns: any[] = [];
      
      // 連続Noパターン
      let consecutiveNos = 0;
      for (let i = recentSessions.length - 1; i >= 0; i--) {
        if (recentSessions[i].result === 'no') {
          consecutiveNos++;
        } else {
          break;
        }
      }
      
      if (consecutiveNos >= 3) {
        patterns.push({
          user_id: userId,
          pattern_type: 'consecutive_no',
          pattern_data: { count: consecutiveNos },
          confidence_score: Math.min(consecutiveNos / 5, 1.0),
          detected_at: new Date().toISOString(),
        });
      }
      
      // 高速スワイプパターン
      if (avgResponseTime < 1000 && recentSessions.length >= 5) {
        patterns.push({
          user_id: userId,
          pattern_type: 'fast_swipe',
          pattern_data: { avgTime: avgResponseTime },
          confidence_score: 0.8,
          detected_at: new Date().toISOString(),
        });
      }
      
      // パターンを保存
      if (patterns.length > 0) {
        const { error } = await supabase
          .from('swipe_pattern_analysis')
          .insert(patterns);
        
        if (error) {
          console.error('[analyzeSessionPatterns] Error saving patterns:', error);
        }
      }
    } catch (error) {
      console.error('[analyzeSessionPatterns] Exception:', error);
    }
  }
  
  /**
   * セッション学習データを取得
   */
  static getSessionLearning(userId: string): SessionSwipe[] {
    return sessionStorage.get(userId) || [];
  }
}

// エクスポート
export const getEnhancedRecommendations = EnhancedRecommendationService.getEnhancedRecommendations.bind(EnhancedRecommendationService);
export const updateSessionLearning = EnhancedRecommendationService.updateSessionLearning.bind(EnhancedRecommendationService);
export const getSessionLearning = EnhancedRecommendationService.getSessionLearning.bind(EnhancedRecommendationService);
export const analyzeEnhancedPreferences = EnhancedRecommendationService.analyzeUserPreferencesEnhanced.bind(EnhancedRecommendationService);
