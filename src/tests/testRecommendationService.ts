// RecommendationServiceのテストスクリプト
import { RecommendationService } from '../services/recommendationService';
import { supabase } from '../services/supabase';

const testRecommendationService = async () => {
  console.log('=== RecommendationServiceテスト開始 ===');
  
  try {
    // テストユーザーID（実際のユーザーIDに置き換える必要がある）
    const testUserId = '4a065a36-f764-420d-a923-f5e9c884b6ea';
    
    // analyzeUserPreferencesのテスト
    console.log('\n1. analyzeUserPreferencesのテスト');
    const preferencesResult = await RecommendationService.analyzeUserPreferences(testUserId);
    
    if (preferencesResult.success && preferencesResult.data) {
      console.log('✅ ユーザー嗜好分析成功');
      console.log('- 好きなタグ:', preferencesResult.data.likedTags.slice(0, 5).join(', '));
      console.log('- 好きなカテゴリ:', preferencesResult.data.preferredCategories.join(', '));
      console.log('- 価格帯:', `${preferencesResult.data.avgPriceRange.min}円 - ${preferencesResult.data.avgPriceRange.max}円`);
    } else {
      console.log('⚠️ ユーザー嗜好データなし');
    }
    
    // getPersonalizedRecommendationsのテスト
    console.log('\n2. getPersonalizedRecommendationsのテスト');
    const recommendationsResult = await RecommendationService.getPersonalizedRecommendations(testUserId, 5);
    
    if (recommendationsResult.success && recommendationsResult.data) {
      console.log('✅ パーソナライズ推薦取得成功');
      console.log('推薦商品数:', recommendationsResult.data.length);
      
      if (recommendationsResult.data.length > 0) {
        console.log('\n最初の推薦商品:');
        const firstRec = recommendationsResult.data[0];
        console.log('- タイトル:', firstRec.title);
        console.log('- 価格:', firstRec.price);
        console.log('- タグ:', firstRec.tags?.join(', ') || 'なし');
      }
    } else {
      console.log('❌ 推薦取得エラー:', recommendationsResult.error);
    }
    
    // getPopularProductsのテスト
    console.log('\n3. getPopularProductsのテスト');
    const popularResult = await RecommendationService.getPopularProducts(5);
    
    if (popularResult.success && popularResult.data) {
      console.log('✅ 人気商品取得成功');
      console.log('人気商品数:', popularResult.data.length);
    } else {
      console.log('❌ 人気商品取得エラー:', popularResult.error);
    }
    
  } catch (error: any) {
    console.error('❌ RecommendationServiceエラー:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n=== RecommendationServiceテスト終了 ===');
};

// テスト実行
testRecommendationService();

export {};
