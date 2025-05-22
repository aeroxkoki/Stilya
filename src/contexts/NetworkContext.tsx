import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: null,
  connectionType: null,
});

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // ネットワーク状態を監視
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    return unsubscribe;
  }, []);

  const value: NetworkContextType = {
    isConnected,
    isInternetReachable,
    connectionType,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  return useContext(NetworkContext);
};