import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'recommendations_cache_';
const CACHE_DURATION = 3600000; // 1時間

export interface CachedRecommendations {
  data: any[];
  timestamp: number;
}

export const getCachedRecommendations = async (
  userId: string
): Promise<CachedRecommendations | null> => {
  try {
    const key = `${CACHE_PREFIX}${userId}`;
    const cached = await AsyncStorage.getItem(key);
    
    if (!cached) return null;
    
    const parsedCache: CachedRecommendations = JSON.parse(cached);
    const now = Date.now();
    
    if (now - parsedCache.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return parsedCache;
  } catch (error) {
    console.error('Error getting cached recommendations:', error);
    return null;
  }
};

export const setCachedRecommendations = async (
  userId: string,
  recommendations: any[]
): Promise<void> => {
  try {
    const key = `${CACHE_PREFIX}${userId}`;
    const cache: CachedRecommendations = {
      data: recommendations,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error('Error setting cached recommendations:', error);
  }
};

export const clearRecommendationCache = async (
  userId: string
): Promise<void> => {
  try {
    const key = `${CACHE_PREFIX}${userId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing recommendation cache:', error);
  }
};
