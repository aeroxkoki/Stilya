import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { 
  EventType,
  trackSessionStart,
  trackSessionEnd,
  trackEvent
} from '@/services/analyticsService';

/**
 * アプリのライフサイクル検知とアナリティクスを統合するフック
 * - アプリの起動/終了を検知
 * - セッション開始/終了を記録
 * - バックグラウンド/フォアグラウンド遷移をトラック
 */
export const useAppLifecycle = () => {
  const { user } = useAuthStore();
  const appState = useRef(AppState.currentState);
  const [isActive, setIsActive] = useState(true);
  const wasActiveRef = useRef(true);
  const sessionTimeoutRef = useRef<number | null>(null);
  const userId = user?.id;

  // ライフサイクルイベントのリスナー設定
  useEffect(() => {
    // アプリの起動をトラック
    const trackAppOpen = async () => {
      await trackEvent(EventType.APP_OPEN, {
        device_info: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      }, userId);
      
      // セッション開始を記録
      await trackSessionStart(userId);
    };

    trackAppOpen();

    // AppStateの変更を監視
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // クリーンアップ関数
    return () => {
      subscription.remove();

      // セッションのタイムアウトクリア
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }

      // アプリ終了前にセッション終了記録を試みる
      trackSessionEnd(userId).catch(console.error);
      trackEvent(EventType.APP_CLOSE, {}, userId).catch(console.error);
    };
  }, [userId]);

  // アプリの状態変更時の処理
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // バックグラウンド→フォアグラウンド
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground');
      setIsActive(true);
      
      // セッションタイムアウトがある場合はクリア
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      // アプリがバックグラウンドから復帰したイベントを記録
      if (!wasActiveRef.current) {
        trackEvent(EventType.APP_OPEN, { from_background: true }, userId)
          .catch(console.error);
          
        // 新しいセッションを開始
        trackSessionStart(userId).catch(console.error);
      }
    } 
    // フォアグラウンド→バックグラウンド
    else if (
      nextAppState.match(/inactive|background/) &&
      appState.current === 'active'
    ) {
      console.log('App has gone to the background');
      setIsActive(false);
      
      // セッション終了のタイムアウトを設定（30秒以上バックグラウンドならセッション終了とみなす）
      sessionTimeoutRef.current = setTimeout(() => {
        wasActiveRef.current = false;
        trackSessionEnd(userId).catch(console.error);
      }, 30000); // 30秒
    }

    appState.current = nextAppState;
    wasActiveRef.current = nextAppState === 'active';
  };

  return {
    isActive
  };
};
