import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { runDiagnostics, formatDiagnosticsResult } from '@/tests/diagnostics';
import { supabase } from '@/services/supabase';
import { NetworkDebugScreen } from '@/screens/debug/NetworkDebugScreen';
import { useStyle } from '@/contexts/ThemeContext';
import { forceCleanupOfflineData } from '@/utils/offlineDataCleanup';

interface DevMenuProps {
  onClose: () => void;
}

export const DevMenu: React.FC<DevMenuProps> = ({ onClose }) => {
  const { theme } = useStyle();
  const [isLoading, setIsLoading] = useState(false);
  const [showNetworkDebug, setShowNetworkDebug] = useState(false);
  const { user } = useAuth();

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await fn();
      Alert.alert('成功', `${action}が完了しました`);
    } catch (error) {
      Alert.alert('エラー', `${action}に失敗しました: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 診断実行
  const runDiagnosticsTest = async () => {
    const result = await runDiagnostics();
    const formattedResult = formatDiagnosticsResult(result);
    Alert.alert('診断結果', formattedResult);
  };

  // キャッシュクリア
  const clearCache = async () => {
    await AsyncStorage.clear();
  };

  // スワイプ履歴クリア
  const clearSwipeHistory = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }
    
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('user_id', user.id);
      
    if (error) throw error;
  };

  // テストユーザーでログイン
  const loginTestUser = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test1749564109932@stilya.com',
      password: 'StrongPass123!',
    });
    
    if (error) throw error;
  };

  // ログアウト
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // オンボーディングデータをリセット
  const resetOnboarding = async () => {
    if (!user) {
      Alert.alert('エラー', 'ログインが必要です');
      return;
    }
    
    const { error } = await supabase
      .from('users')
      .update({
        gender: null,
        style_preferences: null,
        age_group: null
      })
      .eq('id', user.id);
      
    if (error) throw error;
    
    Alert.alert(
      '成功', 
      'オンボーディングデータをリセットしました。\nアプリを再起動してください。',
      [{ text: 'OK' }]
    );
  };

  const menuItems = [
    { 
      title: '🔍 診断を実行', 
      action: () => handleAction('診断', runDiagnosticsTest),
      disabled: false,
    },
    { 
      title: '🌐 ネットワークデバッグ', 
      action: () => setShowNetworkDebug(true),
      disabled: false,
    },
    { 
      title: '🗑️ キャッシュクリア', 
      action: () => handleAction('キャッシュクリア', clearCache),
      disabled: false,
    },
    { 
      title: '📴 オフラインデータクリア', 
      action: () => handleAction('オフラインデータクリア', forceCleanupOfflineData),
      disabled: false,
    },
    { 
      title: '🔄 スワイプ履歴クリア', 
      action: () => handleAction('スワイプ履歴クリア', clearSwipeHistory),
      disabled: !user,
    },
    { 
      title: '🎯 オンボーディングリセット', 
      action: () => resetOnboarding(),
      disabled: !user,
    },
    { 
      title: '👤 テストユーザーログイン', 
      action: () => handleAction('テストユーザーログイン', loginTestUser),
      disabled: !!user,
    },
    { 
      title: '🚪 ログアウト', 
      action: () => handleAction('ログアウト', logout),
      disabled: !user,
    },
  ];

  return (
    <>
      {showNetworkDebug ? (
        <Modal
          visible={true}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowNetworkDebug(false)}
        >
          <View style={{ flex: 1, paddingTop: 50 }}>
            <TouchableOpacity 
              style={{ padding: 15, backgroundColor: '#F5F5F5' }}
              onPress={() => setShowNetworkDebug(false)}
            >
              <Text style={{ fontSize: 16 }}>← 戻る</Text>
            </TouchableOpacity>
            <NetworkDebugScreen />
          </View>
        </Modal>
      ) : (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={onClose}
        >
          <View style={styles.overlay}>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>🛠 開発メニュー</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.content}>
                {user && (
                  <View style={styles.userInfo}>
                    <Text style={styles.userText}>ユーザー: {user.email}</Text>
                  </View>
                )}
                
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      item.disabled && styles.menuItemDisabled,
                    ]}
                    onPress={item.action}
                    disabled={item.disabled || isLoading}
                  >
                    <Text style={[
                      styles.menuItemText,
                      item.disabled && styles.menuItemTextDisabled,
                    ]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 20,
    color: '#666666', // theme.colors.secondary の代わりに固定値
  },
  content: {
    padding: 15,
  },
  userInfo: {
    backgroundColor: '#F5F5F5', // theme.colors.surface の代わりに固定値
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  userText: {
    fontSize: 14,
    color: '#666666', // theme.colors.secondary の代わりに固定値
  },
  menuItem: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1A1A1A', // theme.colors.text.primary の代わりに固定値
  },
  menuItemTextDisabled: {
    color: '#999999', // theme.colors.text.hint の代わりに固定値
  },
});
