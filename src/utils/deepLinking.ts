import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { EventType, trackEvent } from '@/services/analyticsService';

// ディープリンクハンドラー型
export type DeepLinkHandler = (url: string, params: Record<string, string>) => void;

// ディープリンクパラメータをパース
export const parseDeepLink = (url: string): Record<string, string> => {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};
    
    // クエリパラメータを取得
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // パスからパラメータを抽出
    // 例: stilya://product/123 -> { action: 'product', id: '123' }
    const pathParts = parsed.pathname?.split('/').filter(Boolean) || [];
    if (pathParts.length > 0) {
      params.action = pathParts[0];
      
      if (pathParts.length > 1) {
        params.id = pathParts[1];
      }
    }
    
    return params;
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return {};
  }
};

// URLスキームをチェック
export const isAppScheme = (url: string): boolean => {
  return url.startsWith('stilya://') || url.startsWith('com.stilya://');
};

// ディープリンクの処理
export const handleDeepLink = (
  url: string,
  navigation: any,
  userId?: string
): void => {
  if (!url) return;
  
  // App Schema以外は処理しない
  if (!isAppScheme(url)) return;
  
  console.log('Processing deep link:', url);
  
  // URLを解析
  const params = parseDeepLink(url);
  
  // アナリティクスにディープリンク記録
  trackEvent(EventType.SCREEN_VIEW, {
    screen_name: 'deep_link',
    url,
    params,
  }, userId);
  
  // アクションに基づいて処理
  switch (params.action) {
    case 'product':
      if (params.id) {
        navigation.navigate('Recommend', {
          screen: 'ProductDetail',
          params: { productId: params.id },
        });
      }
      break;
      
    case 'reset-password':
      navigation.navigate('Auth', {
        screen: 'ResetPassword',
        params: { token: params.token },
      });
      break;
      
    case 'profile':
      navigation.navigate('Profile');
      break;
      
    case 'recommend':
      navigation.navigate('Recommend');
      break;
      
    case 'swipe':
      navigation.navigate('Swipe');
      break;
      
    default:
      console.log('Unknown deep link action:', params.action);
  }
};

// ディープリンク処理のためのカスタムフック
export const useDeepLinks = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  useEffect(() => {
    // 初期URLのチェック
    const checkInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          handleDeepLink(initialURL, navigation, user?.id);
        }
      } catch (error) {
        console.error('Error checking initial URL:', error);
      }
    };
    
    checkInitialURL();
    
    // リンクイベントのリスナー設定
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url, navigation, user?.id);
    });
    
    // クリーンアップ
    return () => {
      linkingSubscription.remove();
    };
  }, [navigation, user?.id]);
  
  // 商品共有用ディープリンクの生成
  const generateProductLink = (productId: string): string => {
    const scheme = Platform.OS === 'ios' ? 'stilya://' : 'stilya://';
    return `${scheme}product/${productId}`;
  };
  
  return {
    generateProductLink,
  };
};
