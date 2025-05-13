import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * アプリのライフサイクルとネットワーク状態を管理するカスタムフック
 * バックグラウンド/フォアグラウンド切り替え時の処理やネットワーク変化を検知
 */
export const useAppLifecycle = (options: {
  onForeground?: () => void;
  onBackground?: () => void;
  onNetworkChange?: (isConnected: boolean) => void;
}) => {
  const { onForeground, onBackground, onNetworkChange } = options;
  const appState = useRef(AppState.currentState);
  
  // フォアグラウンドに戻った時の処理
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      // アプリがバックグラウンドから戻ってきた場合
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        onForeground?.();
      } 
      // アプリがバックグラウンドに移行した場合
      else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to the background!');
        onBackground?.();
      }
      
      appState.current = nextAppState;
    },
    [onForeground, onBackground]
  );
  
  // ネットワーク状態変化時の処理
  const handleNetworkChange = useCallback(
    (state: any) => {
      const isConnected = state.isConnected && state.isInternetReachable;
      console.log('Network status changed:', isConnected ? 'online' : 'offline');
      onNetworkChange?.(!!isConnected);
    },
    [onNetworkChange]
  );
  
  // イベントリスナーの登録と解除
  useEffect(() => {
    // AppStateのリスナー登録
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // NetInfoのリスナー登録
    const netInfoSubscription = NetInfo.addEventListener(handleNetworkChange);
    
    // 初回のネットワーク状態確認
    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      onNetworkChange?.(!!isConnected);
    });
    
    // クリーンアップ
    return () => {
      subscription.remove();
      netInfoSubscription();
    };
  }, [handleAppStateChange, handleNetworkChange, onNetworkChange]);
  
  // 現在のネットワーク状態を確認するメソッド
  const checkNetworkStatus = useCallback(async () => {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected && netInfo.isInternetReachable;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }, []);
  
  return { checkNetworkStatus };
};
