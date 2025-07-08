import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AB_TEST_KEY = 'ab_test_variants';

export const getABTestVariant = async (
  userId: string,
  testName: string
): Promise<string> => {
  try {
    // キャッシュから取得
    const cached = await AsyncStorage.getItem(`${AB_TEST_KEY}_${testName}`);
    if (cached) {
      return cached;
    }

    // DBから取得
    const { data, error } = await supabase
      .from('ab_test_assignments')
      .select('variant')
      .eq('user_id', userId)
      .eq('test_name', testName)
      .single();

    if (data) {
      await AsyncStorage.setItem(`${AB_TEST_KEY}_${testName}`, data.variant);
      return data.variant;
    }

    // 新規割り当て
    const variant = Math.random() < 0.5 ? 'control' : 'enhanced';
    
    await supabase
      .from('ab_test_assignments')
      .insert({
        user_id: userId,
        test_name: testName,
        variant: variant,
      });

    await AsyncStorage.setItem(`${AB_TEST_KEY}_${testName}`, variant);
    return variant;
  } catch (error) {
    console.error('Error getting AB test variant:', error);
    return 'control'; // デフォルトはコントロール群
  }
};

export const trackABTestEvent = async (
  userId: string,
  testName: string,
  eventName: string,
  eventData?: any
) => {
  try {
    const variant = await getABTestVariant(userId, testName);
    
    // ここでAnalyticsサービスにイベントを送信
    console.log('[AB Test Event]', {
      userId,
      testName,
      variant,
      eventName,
      eventData,
    });
  } catch (error) {
    console.error('Error tracking AB test event:', error);
  }
};
