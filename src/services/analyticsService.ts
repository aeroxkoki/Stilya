import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { useState, useEffect } from 'react';

// イベントタイプ定義
export enum EventType {
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  VIEW_PRODUCT = 'view_product',
  SWIPE_YES = 'swipe_yes',
  SWIPE_NO = 'swipe_no',
  CLICK_PRODUCT = 'click_product',
  SHARE_PRODUCT = 'share_product',
  VIEW_RECOMMENDATION = 'view_recommendation',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  SCREEN_VIEW = 'screen_view',
  FAVORITE_ADD = 'favorite_add',
  FAVORITE_REMOVE = 'favorite_remove',
  ONBOARDING_COMPLETE = 'onboarding_complete',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAIL = 'auth_fail',
}

// イベントデータの型定義
export interface AnalyticsEvent {
  id?: string;
  userId?: string;
  anonymousId: string;
  eventType: EventType;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  deviceInfo?: {
    platform: string;
    osVersion?: string;
    model?: string;
    appVersion?: string;
  };
}

// アナリティクスデータの型定義（レポート画面用）
export interface AnalyticsData {
  // アクティビティ概要
  totalSwipes: number;
  totalFavorites: number;
  totalViews: number;
  activity: Array<{
    date: string;
    swipes: number;
    favorites: number;
    views: number;
  }>;
  
  // コンバージョン
  ctr: string; // クリック率（%）
  cvr: string; // コンバージョン率（%）
  conversion: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  
  // スタイル傾向
  preferredStyles: string[];
  styleTrends: Array<{
    style: string;
    percentage: number;
  }>;
}

// セッション管理
let currentSessionId: string | null = null;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
let lastActivityTimestamp = Date.now();

// 端末情報を取得
export const getDeviceInfo = async () => {
  return {
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    model: await Device.getModelNameAsync(),
    appVersion: Platform.OS === 'ios'
      ? await Application.nativeApplicationVersion
      : Application.nativeApplicationVersion,
  };
};

// 匿名IDの取得または生成
export const getOrCreateAnonymousId = async (): Promise<string> => {
  let anonymousId = await AsyncStorage.getItem('analytics_anonymous_id');
  
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await AsyncStorage.setItem('analytics_anonymous_id', anonymousId);
  }
  
  return anonymousId;
};

// セッションIDの取得または生成
export const getOrCreateSessionId = async (): Promise<string> => {
  if (currentSessionId) {
    // セッションタイムアウトをチェック
    const now = Date.now();
    if (now - lastActivityTimestamp > SESSION_TIMEOUT) {
      // セッションタイムアウト - 新しいセッションを作成
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem('analytics_session_id', newSessionId);
      currentSessionId = newSessionId;
    }
    
    lastActivityTimestamp = now;
    return currentSessionId;
  }
  
  // セッションIDをストレージから復元
  const storedSessionId = await AsyncStorage.getItem('analytics_session_id');
  if (storedSessionId) {
    const storedTimestamp = await AsyncStorage.getItem('analytics_last_activity');
    const lastTimestamp = storedTimestamp ? parseInt(storedTimestamp) : 0;
    const now = Date.now();
    
    // セッションタイムアウトを確認
    if (now - lastTimestamp <= SESSION_TIMEOUT) {
      currentSessionId = storedSessionId;
      lastActivityTimestamp = now;
      await AsyncStorage.setItem('analytics_last_activity', now.toString());
      return currentSessionId;
    }
  }
  
  // 新しいセッションを作成
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  currentSessionId = newSessionId;
  lastActivityTimestamp = Date.now();
  
  await AsyncStorage.setItem('analytics_session_id', newSessionId);
  await AsyncStorage.setItem('analytics_last_activity', lastActivityTimestamp.toString());
  
  return newSessionId;
};

// エラー発生時のキューイング
const QUEUE_KEY = 'analytics_event_queue';

// キューイングされたイベントを送信
export const flushQueue = async (): Promise<void> => {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueStr) return;
    
    const queue: AnalyticsEvent[] = JSON.parse(queueStr);
    if (queue.length === 0) return;
    
    // 複数イベントを一括送信
    const { error } = await supabase
      .from('analytics_events')
      .insert(queue);
      
    if (!error) {
      // 成功したらキューをクリア
      await AsyncStorage.removeItem(QUEUE_KEY);
    } else {
      console.error('Failed to flush analytics queue:', error);
    }
  } catch (error) {
    console.error('Error processing analytics queue:', error);
  }
};

// イベントをキューに追加
const queueEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = queueStr ? JSON.parse(queueStr) : [];
    
    queue.push(event);
    
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queuing analytics event:', error);
  }
};

// イベントを記録する基本関数
export const trackEvent = async (
  eventType: EventType,
  properties: Record<string, any> = {},
  userId?: string
): Promise<void> => {
  try {
    // 開発環境ではログだけ出力
    if (__DEV__) {
      console.log(`[Analytics] Event: ${eventType}`, { properties, userId });
      return;
    }
    
    const anonymousId = await getOrCreateAnonymousId();
    const sessionId = await getOrCreateSessionId();
    const deviceInfo = await getDeviceInfo();
    
    const event: AnalyticsEvent = {
      userId,
      anonymousId,
      eventType,
      properties,
      timestamp: new Date().toISOString(),
      sessionId,
      deviceInfo,
    };
    
    // Supabaseにイベントを記録
    const { error } = await supabase.from('analytics_events').insert([event]);
    
    if (error) {
      console.error('Failed to track event:', error);
      // エラー時はキューに追加
      await queueEvent(event);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// 画面表示イベント
export const trackScreenView = async (
  screenName: string,
  params: Record<string, any> = {},
  userId?: string
): Promise<void> => {
  await trackEvent(EventType.SCREEN_VIEW, {
    screen_name: screenName,
    ...params
  }, userId);
};

// セッション開始イベント
export const trackSessionStart = async (userId?: string): Promise<void> => {
  await trackEvent(EventType.SESSION_START, {}, userId);
};

// セッション終了イベント
export const trackSessionEnd = async (userId?: string): Promise<void> => {
  await trackEvent(EventType.SESSION_END, {
    duration_ms: Date.now() - lastActivityTimestamp
  }, userId);
};

// 商品表示イベント
export const trackProductView = async (
  productId: string,
  productData: Record<string, any>,
  userId?: string
): Promise<void> => {
  await trackEvent(EventType.VIEW_PRODUCT, {
    product_id: productId,
    ...productData
  }, userId);
};

// 商品クリックイベント
export const trackProductClick = async (
  productId: string,
  productData: Record<string, any>,
  userId?: string
): Promise<void> => {
  await trackEvent(EventType.CLICK_PRODUCT, {
    product_id: productId,
    ...productData
  }, userId);
};

// スワイプイベント
export const trackSwipe = async (
  productId: string,
  result: 'yes' | 'no',
  userId?: string
): Promise<void> => {
  const eventType = result === 'yes' ? EventType.SWIPE_YES : EventType.SWIPE_NO;
  await trackEvent(eventType, {
    product_id: productId,
  }, userId);
};

// 商品シェアイベント
export const trackShare = async (
  productId: string,
  platform?: string,
  userId?: string
): Promise<void> => {
  await trackEvent(EventType.SHARE_PRODUCT, {
    product_id: productId,
    platform,
  }, userId);
};

// オンボーディング完了イベント
export const trackOnboardingComplete = async (
  onboardingData: Record<string, any>,
  userId?: string
): Promise<void> => {
  await trackEvent(EventType.ONBOARDING_COMPLETE, onboardingData, userId);
};

// アナリティクスデータの取得（レポート画面用）
export const getAnalyticsData = async (userId?: string): Promise<AnalyticsData> => {
  try {
    // MVPではモックデータを返す
    // 実際の実装では、Supabaseからイベントデータを取得して集計する
    // サイドエフェクトとして、最近のイベントをキャッシュする
    
    // ユーザーのアクティビティを取得（あれば）
    const anonymousId = await getOrCreateAnonymousId();
    
    // 日付生成ヘルパー
    const getLastNDays = (n: number) => {
      const dates: string[] = [];
      const today = new Date();
      
      for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return dates;
    };
    
    // 過去7日間の日付を生成
    const last7Days = getLastNDays(7);
    
    // ユーザーの嗜好分析用のスタイルリスト
    const styleOptions = ['カジュアル', 'モード', 'ナチュラル', 'ストリート', 'クラシック', 'フェミニン'];
    
    // アクティビティデータを生成
    const activity = last7Days.map(date => ({
      date,
      swipes: Math.floor(Math.random() * 30),
      favorites: Math.floor(Math.random() * 10),
      views: Math.floor(Math.random() * 15),
    }));
    
    // 合計を計算
    const totalSwipes = activity.reduce((acc, day) => acc + day.swipes, 0);
    const totalFavorites = activity.reduce((acc, day) => acc + day.favorites, 0);
    const totalViews = activity.reduce((acc, day) => acc + day.views, 0);
    
    // コンバージョンデータを生成
    const conversion = last7Days.map(date => ({
      date,
      impressions: Math.floor(Math.random() * 50) + 10,
      clicks: Math.floor(Math.random() * 15),
      conversions: Math.floor(Math.random() * 3),
    }));
    
    // CTRとCVRを計算
    const totalImpressions = conversion.reduce((acc, day) => acc + day.impressions, 0);
    const totalClicks = conversion.reduce((acc, day) => acc + day.clicks, 0);
    const totalConversions = conversion.reduce((acc, day) => acc + day.conversions, 0);
    
    const ctr = totalImpressions > 0 
      ? ((totalClicks / totalImpressions) * 100).toFixed(1) 
      : '0.0';
      
    const cvr = totalClicks > 0 
      ? ((totalConversions / totalClicks) * 100).toFixed(1) 
      : '0.0';
    
    // スタイル傾向分析
    // ランダムにスタイル傾向を生成
    let remainingPercentage = 100;
    const styleTrends = styleOptions.map((style, index) => {
      if (index === styleOptions.length - 1) {
        return { style, percentage: remainingPercentage };
      }
      
      const percentage = index === 0 
        ? Math.floor(Math.random() * 40) + 10 // 最初のスタイルは主要傾向にする
        : Math.floor(Math.random() * Math.min(30, remainingPercentage - styleOptions.length + index + 1));
        
      remainingPercentage -= percentage;
      return { style, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
    
    // 上位2つを好みのスタイルとして抽出
    const preferredStyles = styleTrends
      .slice(0, 2)
      .map(style => style.style);
    
    // レスポンスを生成
    return {
      totalSwipes,
      totalFavorites,
      totalViews,
      activity,
      ctr,
      cvr,
      conversion,
      preferredStyles,
      styleTrends,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Reactフックとして使用するためのカスタムフック
export const useAnalytics = (userId?: string) => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const initAnalytics = async () => {
      await getOrCreateSessionId();
      await flushQueue();
      setIsReady(true);
    };
    
    initAnalytics();
    
    return () => {
      // コンポーネントのアンマウント時にセッション終了を記録
      trackSessionEnd(userId).catch(console.error);
    };
  }, [userId]);
  
  return {
    isReady,
    trackEvent: (eventType: EventType, properties: Record<string, any> = {}) => 
      trackEvent(eventType, properties, userId),
    trackScreenView: (screenName: string, params: Record<string, any> = {}) => 
      trackScreenView(screenName, params, userId),
    trackProductView: (productId: string, productData: Record<string, any>) => 
      trackProductView(productId, productData, userId),
    trackProductClick: (productId: string, productData: Record<string, any>) => 
      trackProductClick(productId, productData, userId),
    trackSwipe: (productId: string, result: 'yes' | 'no') => 
      trackSwipe(productId, result, userId),
    trackShare: (productId: string, platform?: string) => 
      trackShare(productId, platform, userId),
  };
};
