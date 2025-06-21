import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '@/contexts/NetworkContext';
import { useStyle } from '@/contexts/ThemeContext';

/**
 * オフライン状態を表示するバナーコンポーネント
 */
const OfflineNotice: React.FC = () => {
  const { theme } = useStyle();
  const { isConnected, lastSync } = useNetwork();
  const [slideAnim] = useState(new Animated.Value(-100)); // 初期位置は画面外

  // 接続状態によってアニメーションを制御
  useEffect(() => {
    if (isConnected === false) {
      // オフラインになった場合、バナーを表示
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else if (isConnected === true) {
      // オンラインに戻った場合、バナーを非表示
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected]);

  // 最後の同期情報を表示
  const getLastSyncText = () => {
    if (!lastSync) return '';
    
    const now = new Date();
    const syncTime = new Date(lastSync);
    const diffMs = now.getTime() - syncTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'たった今同期されました';
    } else if (diffMins < 60) {
      return `${diffMins}分前に同期されました`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return `${diffHours}時間前に同期されました`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}日前に同期されました`;
      }
    }
  };

  // オフライン時のみ表示
  if (isConnected !== false) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          shadowColor: theme.colors.primary,
        },
      ]}
      testID="offline-notice"
    >
      <View style={styles.contentContainer}>
        <Ionicons
          name="cloud-offline"
          size={20}
          color="#F57C00"
          style={styles.icon}
        />
        <View>
          <Text style={styles.title}>オフラインモード</Text>
          <Text style={styles.message}>
            インターネットに接続されていません。一部の機能が制限されます。
          </Text>
          {lastSync && (
            <Text style={[styles.syncInfo, { color: theme.colors.text.hint }]}>
              {getLastSyncText()}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E1',
    paddingTop: 45, // ステータスバーの高さを考慮
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  message: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  syncInfo: {
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default OfflineNotice;
