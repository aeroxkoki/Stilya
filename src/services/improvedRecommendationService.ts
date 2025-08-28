/**
 * 改善版推薦サービス
 * 連続No対応、セッション学習、時系列考慮、探索と活用のバランス、コンテキスト認識を実装
 */

import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { Product, UserPreference } from '../types';
import { normalizeProduct } from './recommendationService';
import { addScoreNoise, shuffleArray, ensureProductDiversity } from '../utils/randomUtils';
import { FilterOptions } from '@/contexts/FilterContext';

// セッションデータの型定義
interface SessionData {
  userId: string;
  swipes: Array<{
    productId: string;
    result: 'yes' | 'no';
    timestamp: Date;
    tags: string[];
    category: string;
    brand?: string;
    price?: number;
  }>;
  consecutiveNos: number;
  lastCategoryShift?: Date;
  sessionStart: Date;
  totalSwipes: number;
}

// コンテキスト情報の型定義
interface ContextInfo {
  dayOfWeek: 'weekday' | 'weekend';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  isHoliday?: boolean;
}

// セッションストレージ（メモリ内管理）
const sessionStorage = new Map<string, SessionData>();

// セッションタイムアウト（30分）
const SESSION_TIMEOUT = 30 * 60 * 1000;

export class ImprovedRecommendationService {
  /**
   * セッションデータの取得または作成
   */
  private static getOrCreateSession(userId: string): SessionData {
    const existing = sessionStorage.get(userId);
    const now = new Date();
    
    // セッションが存在し、タイムアウトしていない場合は既存のものを返す
    if (existing && (now.getTime() - existing.sessionStart.getTime() < SESSION_TIMEOUT)) {
      return existing;
    }
    
    // 新しいセッションを作成
    const newSession: SessionData = {
      userId,
      swipes: [],
      consecutiveNos: 0,
      sessionStart: now,
      totalSwipes: 0,
    };
    
    sessionStorage.set(userId, newSession);
    return newSession;
  }
  
  /**
   * セッションにスワイプを記録
   */
  static recordSwipeToSession(
    userId: string,
    productId: string,
    result: 'yes' | 'no',
    product: Product
  ): void {
    const session = this.getOrCreateSession(userId);
    
    // スワイプ情報を記録
    session.swipes.push({
      productId,
      result,
      timestamp: new Date(),
      tags: product.tags || [],
      category: product.category || '',
      brand: product.brand,
      price: product.price,
    });
    
    session.totalSwipes++;
    
    // 連続Noのカウント
    if (result === 'no') {
      session.consecutiveNos++;
      
      // 3連続Noでカテゴリシフトのフラグを立てる
      if (session.consecutiveNos === 3) {
        session.lastCategoryShift = new Date();
        console.log('[ImprovedRecommendation] 3連続No検出 - カテゴリをシフトします');
      }
      
      // 5連続Noで休憩提案
      if (session.consecutiveNos === 5) {
        console.log('[ImprovedRecommendation] 5連続No検出 - 休憩を提案します');
        // 実際のUIでは、休憩提案のモーダルを表示するなどの処理を行う
      }
    } else {
      session.consecutiveNos = 0; // Yesでリセット
    }
    
    // セッション更新
    sessionStorage.set(userId, session);
  }
  
  /**
   * 現在のコンテキスト情報を取得
   */
  private static getCurrentContext(): ContextInfo {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth() + 1;
    
    // 曜日の判定
    const dayOfWeek: 'weekday' | 'weekend' = (day === 0 || day === 6) ? 'weekend' : 'weekday';
    
    // 時間帯の判定
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }
    
    // 季節の判定（日本の季節）
    let season: 'spring' | 'summer' | 'autumn' | 'winter';
    if (month >= 3 && month <= 5) {
      season = 'spring';
    } else if (month >= 6 && month <= 8) {
      season = 'summer';
    } else if (month >= 9 && month <= 11) {
      season = 'autumn';
    } else {
      season = 'winter';
    }
    
    return {
      dayOfWeek,
      timeOfDay,
      season,
    };
  }
  
  /**
   * コンテキストに基づくタグブースト
   */
  private static getContextualBoosts(context: ContextInfo): Record<string, number> {
    const boosts: Record<string, number> = {};
    
    // 曜日による調整
    if (context.dayOfWeek === 'weekend') {
      boosts['カジュアル'] = 1.3;
      boosts['デート'] = 1.2;
      boosts['リラックス'] = 1.2;
      boosts['スポーツ'] = 1.1;
    } else {
      boosts['ビジネス'] = 1.3;
      boosts['オフィス'] = 1.2;
      boosts['フォーマル'] = 1.1;
      boosts['きれいめ'] = 1.1;
    }
    
    // 時間帯による調整
    switch (context.timeOfDay) {
      case 'morning':
        boosts['通勤'] = 1.2;
        boosts['ビジネス'] = 1.1;
        break;
      case 'evening':
        boosts['ディナー'] = 1.3;
        boosts['パーティー'] = 1.2;
        boosts['デート'] = 1.2;
        break;
      case 'night':
        boosts['部屋着'] = 1.2;
        boosts['リラックス'] = 1.3;
        break;
    }
    
    // 季節による調整
    switch (context.season) {
      case 'summer':
        boosts['涼しい'] = 1.5;
        boosts['半袖'] = 1.4;
        boosts['リネン'] = 1.3;
        boosts['サンダル'] = 1.2;
        break;
      case 'winter':
        boosts['暖かい'] = 1.5;
        boosts['ニット'] = 1.4;
        boosts['コート'] = 1.3;
        boosts['ブーツ'] = 1.2;
        break;
      case 'spring':
        boosts['軽やか'] = 1.3;
        boosts['パステル'] = 1.2;
        boosts['花柄'] = 1.1;
        break;
      case 'autumn':
        boosts['アウター'] = 1.3;
        boosts['ブラウン'] = 1.2;
        boosts['チェック'] = 1.1;
        break;
    }
    
    return boosts;
  }
  
  /**
   * 時間減衰を考慮したスコア計算
   */
  private static calculateTimeDecayedScore(
    baseScore: number,
    swipeDate: Date | string,
    decayRate: number = 30 // 30日で半減
  ): number {
    const now = new Date();
    const swipeTime = new Date(swipeDate);
    const daysSinceSwipe = (now.getTime() - swipeTime.getTime()) / (1000 * 60 * 60 * 24);
    
    // 指数関数的減衰
    const timeDecay = Math.exp(-(daysSinceSwipe / decayRate));
    return baseScore * timeDecay;
  }
  
  /**
   * ε-greedy戦略による探索率の計算
   */
  private static calculateExplorationRate(totalSwipes: number): number {
    // スワイプ数が増えるほど探索率を下げる（最小10%）
    const baseExploration = 0.3;
    const minExploration = 0.1;
    const decayFactor = 1000; // 1000スワイプで最小値に近づく
    
    const explorationRate = Math.max(
      minExploration,
      baseExploration - (totalSwipes / decayFactor) * (baseExploration - minExploration)
    );
    
    return explorationRate;
  }
  
  /**
   * セッション内の即時学習を反映した調整
   */
  private static getSessionAdjustments(session: SessionData): {
    avoidTags: string[];
    avoidCategories: string[];
    avoidBrands: string[];
    boostTags: string[];
    shouldShiftCategory: boolean;
    suggestBreak: boolean;
  } {
    const adjustments = {
      avoidTags: [] as string[],
      avoidCategories: [] as string[],
      avoidBrands: [] as string[],
      boostTags: [] as string[],
      shouldShiftCategory: false,
      suggestBreak: false,
    };
    
    // 直近10件のスワイプを分析
    const recentSwipes = session.swipes.slice(-10);
    if (recentSwipes.length === 0) {
      return adjustments;
    }
    
    // タグ、カテゴリ、ブランドの集計
    const tagCounts: Record<string, { yes: number; no: number }> = {};
    const categoryCounts: Record<string, { yes: number; no: number }> = {};
    const brandCounts: Record<string, { yes: number; no: number }> = {};
    
    recentSwipes.forEach(swipe => {
      // タグの集計
      swipe.tags.forEach(tag => {
        if (!tagCounts[tag]) tagCounts[tag] = { yes: 0, no: 0 };
        tagCounts[tag][swipe.result === 'yes' ? 'yes' : 'no']++;
      });
      
      // カテゴリの集計
      if (swipe.category) {
        if (!categoryCounts[swipe.category]) {
          categoryCounts[swipe.category] = { yes: 0, no: 0 };
        }
        categoryCounts[swipe.category][swipe.result === 'yes' ? 'yes' : 'no']++;
      }
      
      // ブランドの集計
      if (swipe.brand) {
        if (!brandCounts[swipe.brand]) {
          brandCounts[swipe.brand] = { yes: 0, no: 0 };
        }
        brandCounts[swipe.brand][swipe.result === 'yes' ? 'yes' : 'no']++;
      }
    });
    
    // 避けるべきタグ（No率が高い）
    Object.entries(tagCounts).forEach(([tag, counts]) => {
      if (counts.no >= 3 && counts.no > counts.yes * 2) {
        adjustments.avoidTags.push(tag);
      } else if (counts.yes >= 3 && counts.yes > counts.no * 2) {
        adjustments.boostTags.push(tag);
      }
    });
    
    // 避けるべきカテゴリ
    Object.entries(categoryCounts).forEach(([category, counts]) => {
      if (counts.no >= 2 && counts.no > counts.yes) {
        adjustments.avoidCategories.push(category);
      }
    });
    
    // 避けるべきブランド
    Object.entries(brandCounts).forEach(([brand, counts]) => {
      if (counts.no >= 2 && counts.no > counts.yes) {
        adjustments.avoidBrands.push(brand);
      }
    });
    
    // 連続Noへの対応
    if (session.consecutiveNos >= 3) {
      adjustments.shouldShiftCategory = true;
    }
    
    if (session.consecutiveNos >= 5) {
      adjustments.suggestBreak = true;
    }
    
    return adjustments;
  }
  
  /**
   * 改善版パーソナライズド推薦
   */
  static async getImprovedRecommendations(
    userId: string | undefined | null,
    limit: number = 20,
    filters?: FilterOptions
  ): Promise<{ success: boolean; data?: Product[]; error?: string; suggestBreak?: boolean }> {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[getImprovedRecommendations] Invalid userId:', userId);
        // 人気商品を返す
        const { RecommendationService } = await import('./recommendationService');
        return await RecommendationService.getPopularProducts(limit);
      }
      
      // セッションデータの取得
      const session = this.getOrCreateSession(userId);
      const sessionAdjustments = this.getSessionAdjustments(session);
      
      // 休憩提案フラグ
      if (sessionAdjustments.suggestBreak) {
        console.log('[ImprovedRecommendations] 休憩を提案します');
      }
      
      // コンテキスト情報の取得
      const context = this.getCurrentContext();
      const contextBoosts = this.getContextualBoosts(context);
      
      // ユーザー嗜好の分析（時間減衰を考慮）
      const { RecommendationService } = await import('./recommendationService');
      const preferencesResult = await RecommendationService.analyzeUserPreferences(userId);
      
      if (!preferencesResult.success || !preferencesResult.data) {
        return await RecommendationService.getPopularProducts(limit);
      }
      
      const preferences = preferencesResult.data;
      
      // 探索率の計算
      const totalSwipes = (await supabase
        .from(TABLES.SWIPES)
        .select('id', { count: 'exact' })
        .eq('user_id', userId)).count || 0;
      
      const explorationRate = this.calculateExplorationRate(totalSwipes);
      const shouldExplore = Math.random() < explorationRate;
      
      console.log(`[ImprovedRecommendations] 探索率: ${(explorationRate * 100).toFixed(1)}%, 探索モード: ${shouldExplore}`);
      
      // 商品プールのサイズを決定
      const poolSize = limit * 10;
      
      // カテゴリシフトが必要な場合、異なるカテゴリから商品を取得
      let query = supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .eq('is_active', true);
      
      // セッション調整を適用（回避すべきものを除外）
      if (sessionAdjustments.avoidBrands.length > 0) {
        query = query.not('brand', 'in', `(${sessionAdjustments.avoidBrands.join(',')})`);
      }
      
      if (sessionAdjustments.shouldShiftCategory && sessionAdjustments.avoidCategories.length > 0) {
        // カテゴリシフト時は避けるべきカテゴリを除外
        query = query.not('category', 'in', `(${sessionAdjustments.avoidCategories.join(',')})`);
        console.log('[ImprovedRecommendations] カテゴリシフトを実行');
      }
      
      // 探索モードの場合はランダムな商品を含める
      if (shouldExplore) {
        // ユーザーが普段選ばないようなタグの商品を取得
        const unusedTags = ['トレンド', '実験的', 'アバンギャルド', '個性的', '新作'];
        query = query.contains('tags', unusedTags);
        console.log('[ImprovedRecommendations] 探索モード: 新しいスタイルを提案');
      }
      
      const { data: products, error } = await query
        .order('created_at', { ascending: false })
        .limit(poolSize);
      
      if (error) {
        console.error('[getImprovedRecommendations] Error fetching products:', error);
        return handleSupabaseError(error);
      }
      
      if (!products || products.length === 0) {
        return handleSupabaseSuccess([]);
      }
      
      // スワイプ済み商品を除外
      const { data: swipedProducts } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);
      
      const swipedProductIds = new Set(swipedProducts?.map(s => s.product_id) || []);
      
      // 時間減衰を考慮したスコアリング
      const scoredProducts = products
        .filter(product => !swipedProductIds.has(product.id))
        .map(product => {
          const normalizedProduct = normalizeProduct(product);
          const tags = normalizedProduct.tags || [];
          let totalScore = 0;
          
          // 基本的なタグスコア
          let tagScore = 0;
          tags.forEach(tag => {
            let score = preferences.tagScores?.[tag] || 0;
            
            // セッション調整
            if (sessionAdjustments.avoidTags.includes(tag)) {
              score *= 0.3; // 避けるべきタグは大幅減点
            } else if (sessionAdjustments.boostTags.includes(tag)) {
              score *= 1.5; // ブーストタグは加点
            }
            
            // コンテキストブースト
            const contextBoost = contextBoosts[tag] || 1.0;
            score *= contextBoost;
            
            tagScore += score;
          });
          tagScore = tagScore / Math.max(tags.length, 1);
          
          // カテゴリスコア
          let categoryScore = 0;
          if (normalizedProduct.category) {
            if (preferences.preferredCategories?.includes(normalizedProduct.category)) {
              categoryScore = 1;
              // セッション調整
              if (sessionAdjustments.avoidCategories.includes(normalizedProduct.category)) {
                categoryScore *= 0.3;
              }
            }
          }
          
          // ブランドスコア
          let brandScore = 0;
          if (normalizedProduct.brand) {
            if (preferences.brands?.includes(normalizedProduct.brand)) {
              brandScore = 1;
              // セッション調整
              if (sessionAdjustments.avoidBrands.includes(normalizedProduct.brand)) {
                brandScore = 0; // 避けるブランドは完全に除外
              }
            }
          }
          
          // 価格スコア（既存の計算を利用）
          const priceScore = preferences.avgPriceRange 
            ? this.calculatePriceScore(normalizedProduct.price || 0, preferences.avgPriceRange)
            : 0.5;
          
          // 季節スコア
          const seasonalScore = this.calculateSeasonalScore(normalizedProduct, context.season);
          
          // 人気度スコア
          const popularityScore = this.calculatePopularityScore(normalizedProduct);
          
          // 新規性ボーナス（探索モード時）
          const noveltyBonus = shouldExplore ? 0.3 : 0;
          
          // 重み付けの計算（スワイプ数に応じて動的に調整）
          const weights = this.calculateDynamicWeights(totalSwipes);
          
          // 総合スコア
          totalScore = 
            tagScore * weights.tag +
            categoryScore * weights.category +
            brandScore * weights.brand +
            priceScore * weights.price +
            seasonalScore * weights.seasonal +
            popularityScore * weights.popularity +
            noveltyBonus;
          
          return {
            ...normalizedProduct,
            score: totalScore,
          };
        })
        .sort((a, b) => b.score - a.score);
      
      // スコアにノイズを追加（探索モード時は大きめのノイズ）
      const noiseLevel = shouldExplore ? 0.5 : 0.3;
      const noisyProducts = scoredProducts.map(product => ({
        ...product,
        score: addScoreNoise(product.score, noiseLevel)
      }));
      
      // 再ソート
      noisyProducts.sort((a, b) => b.score - a.score);
      
      // 多様性を確保
      const diverseProducts = ensureProductDiversity(noisyProducts, {
        maxSameCategory: sessionAdjustments.shouldShiftCategory ? 1 : 2, // カテゴリシフト時は同一カテゴリを減らす
        maxSameBrand: 2,
        maxSamePriceRange: 3,
        windowSize: 5
      });
      
      // scoreプロパティを削除して返す
      const recommendations = diverseProducts
        .slice(0, limit)
        .map(({ score, ...product }) => product);
      
      return {
        success: true,
        data: recommendations,
        suggestBreak: sessionAdjustments.suggestBreak,
      };
      
    } catch (error) {
      console.error('[getImprovedRecommendations] Error:', error);
      return handleSupabaseError(error as Error);
    }
  }
  
  /**
   * 価格スコアの計算（ガウス分布）
   */
  private static calculatePriceScore(
    productPrice: number,
    userPriceRange: { min: number; max: number }
  ): number {
    const center = (userPriceRange.min + userPriceRange.max) / 2;
    const sigma = (userPriceRange.max - userPriceRange.min) / 4;
    
    const score = Math.exp(-Math.pow(productPrice - center, 2) / (2 * sigma * sigma));
    return score;
  }
  
  /**
   * 季節スコアの計算（コンテキスト対応版）
   */
  private static calculateSeasonalScore(product: Product, currentSeason: string): number {
    const tags = product.tags || [];
    
    // 季節タグのマッピング
    const seasonTags: Record<string, string[]> = {
      spring: ['春', '春夏', '軽やか', 'パステル'],
      summer: ['夏', '春夏', '涼しい', '半袖', 'サンダル'],
      autumn: ['秋', '秋冬', 'アウター', 'ブラウン'],
      winter: ['冬', '秋冬', '暖かい', 'ニット', 'コート'],
    };
    
    // オールシーズン商品
    if (tags.includes('オールシーズン')) {
      return 1.0;
    }
    
    // 現在の季節にマッチする商品
    const currentSeasonTags = seasonTags[currentSeason] || [];
    const matchCount = tags.filter(tag => 
      currentSeasonTags.some(seasonTag => tag.includes(seasonTag))
    ).length;
    
    if (matchCount > 0) {
      return 1.5 + (matchCount * 0.2); // 複数マッチでボーナス
    }
    
    // 季節外れ商品のペナルティ
    const otherSeasons = Object.keys(seasonTags).filter(s => s !== currentSeason);
    for (const season of otherSeasons) {
      const otherSeasonTags = seasonTags[season];
      const mismatchCount = tags.filter(tag => 
        otherSeasonTags.some(seasonTag => tag.includes(seasonTag))
      ).length;
      
      if (mismatchCount > 0) {
        return 0.5; // 季節外れはペナルティ
      }
    }
    
    return 1.0; // デフォルト
  }
  
  /**
   * 人気度スコアの計算
   */
  private static calculatePopularityScore(product: Product): number {
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    
    if (reviewCount === 0) return 0;
    
    const reviewScore = Math.log(reviewCount + 1) / 10;
    const popularityScore = (rating / 5) * reviewScore;
    
    return popularityScore;
  }
  
  /**
   * 動的な重み付けを計算
   */
  private static calculateDynamicWeights(totalSwipes: number): Record<string, number> {
    if (totalSwipes < 10) {
      // 初期は人気度と季節性を重視
      return {
        tag: 0.8,
        category: 1.0,
        brand: 0.5,
        price: 1.0,
        seasonal: 2.0,
        popularity: 2.5,
      };
    } else if (totalSwipes < 50) {
      // 中期は嗜好学習とのバランス
      return {
        tag: 1.5,
        category: 1.2,
        brand: 0.8,
        price: 1.2,
        seasonal: 1.8,
        popularity: 1.5,
      };
    } else {
      // 十分な学習後は嗜好を重視
      return {
        tag: 2.5,
        category: 1.5,
        brand: 1.2,
        price: 1.5,
        seasonal: 1.5,
        popularity: 1.0,
      };
    }
  }
  
  /**
   * セッションのクリーンアップ（定期実行用）
   */
  static cleanupSessions(): void {
    const now = new Date().getTime();
    const sessionsToRemove: string[] = [];
    
    sessionStorage.forEach((session, userId) => {
      if (now - session.sessionStart.getTime() > SESSION_TIMEOUT) {
        sessionsToRemove.push(userId);
      }
    });
    
    sessionsToRemove.forEach(userId => {
      sessionStorage.delete(userId);
    });
    
    console.log(`[ImprovedRecommendations] Cleaned up ${sessionsToRemove.length} expired sessions`);
  }
}

// 定期的にセッションをクリーンアップ（5分ごと）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ImprovedRecommendationService.cleanupSessions();
  }, 5 * 60 * 1000);
}

// 既存のenhancedRecommendationServiceとの互換性のためのエクスポート
export const updateSessionLearning = (
  userId: string, 
  data: { productId: string; result: 'yes' | 'no'; responseTime?: number }
) => {
  // ダミーのProductオブジェクトを作成（完全な商品情報がない場合）
  const dummyProduct = {
    id: data.productId,
    title: '',
    price: 0,
    image_url: '',
    tags: [],
    category: '',
    brand: '',
    description: '',
    affiliate_url: '',
    is_active: true,
    source: 'unknown',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  ImprovedRecommendationService.recordSwipeToSession(
    userId,
    data.productId,
    data.result,
    dummyProduct
  );
};
