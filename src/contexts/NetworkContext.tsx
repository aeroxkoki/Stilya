import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncOfflineSwipes } from '@/services/swipeService';

interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  syncOfflineData: () => Promise<void>;
  lastSync: Date | null;
}

// コンテキストの作成
export const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  isInternetReachable: null,
  syncOfflineData: async () => {},
  lastSync: null,
});

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<{
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
  }>({
    isConnected: null,
    isInternetReachable: null,
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [previouslyConnected, setPreviouslyConnected] = useState<boolean | null>(null);

  // ネットワーク状態の変化を監視
  useEffect(() => {
    // 初期状態を取得
    const getInitialState = async () => {
      const state = await NetInfo.fetch();
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
      setPreviouslyConnected(state.isConnected);
    };

    getInitialState();

    // 状態変化のリスナーを登録
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      console.log('Network state changed:', state);
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      // オフラインからオンラインに戻った場合、オフラインデータを同期
      if (previouslyConnected === false && state.isConnected === true) {
        syncOfflineData();
      }

      setPreviouslyConnected(state.isConnected);
    });

    // クリーンアップ関数
    return () => {
      unsubscribe();
    };
  }, [previouslyConnected]);

  // オフラインデータの同期機能
  const syncOfflineData = async () => {
    try {
      if (networkState.isConnected) {
        console.log('Syncing offline data...');
        
        // スワイプデータの同期
        await syncOfflineSwipes();
        
        // 同期完了時刻を更新
        setLastSync(new Date());
        
        console.log('Offline data synced successfully');
      } else {
        console.log('Cannot sync offline data: device is offline');
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        syncOfflineData,
        lastSync,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

// カスタムフックの作成
export const useNetwork = () => useContext(NetworkContext);
