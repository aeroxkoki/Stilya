import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { ProfileStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
import { DevMenu } from '@/components/dev/DevMenu';
import { STYLE_ID_TO_JP_TAG, AGE_GROUPS } from '@/constants/constants';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, loading } = useAuth();
  const { theme } = useStyle();
  
  // デバッグモーダルの表示状態
  const [showDebugModal, setShowDebugModal] = useState(false);
  // 開発メニューの表示状態
  const [showDevMenu, setShowDevMenu] = useState(false);
  // タップカウント（隠し機能用）
  const [tapCount, setTapCount] = useState(0);
  
  // 動的スタイルを生成
  const dynamicStyles = {
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: theme.colors.background,
    },
  };

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト確認',
      '本当にログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  // ヘッダータイトルの隠しタップ機能（5回タップで開発メニュー表示）
  const handleSecretTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 5) {
      setShowDevMenu(true);
      setTapCount(0); // カウントをリセット
    }
    
    // 3秒後にカウントをリセット
    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  const handleNavigateToFavorites = () => {
    navigation.navigate('Favorites');
  };

  const handleNavigateToSwipeHistory = () => {
    navigation.navigate('SwipeHistory');
  };

  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNavigateToHelp = () => {
    // TODO: ヘルプページの実装
    Alert.alert(
      'ヘルプ・サポート',
      'お問い合わせは support@stilya.jp までご連絡ください。\n\nバージョン: 0.1.0 (MVP)',
      [{ text: 'OK', style: 'default' }]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            ログインしていません
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const genderMap = {
    male: '男性',
    female: '女性',
    other: 'その他',
  };

  // 年齢グループの日本語表示を取得
  const getAgeGroupLabel = (ageGroupId?: string): string => {
    if (!ageGroupId) return '未設定';
    const ageGroup = AGE_GROUPS.find(group => group.id === ageGroupId);
    return ageGroup?.label || ageGroupId;
  };

  // スタイル選好の日本語表示を取得
  const getStylePreferenceLabel = (stylePreferences?: string[]): string => {
    if (!stylePreferences || stylePreferences.length === 0) return '未設定';
    
    return stylePreferences
      .map(style => STYLE_ID_TO_JP_TAG[style] || style)
      .join('、');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              マイページ
            </Text>
          </TouchableOpacity>
        </View>

        {/* プロフィール情報 */}
        <View style={styles.section}>
          <Card>
            <View style={styles.profileContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={dynamicStyles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                {user?.email || 'ユーザー'}
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                  性別
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                  {user?.gender ? genderMap[user.gender] || user.gender : '未設定'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                  年齢
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                  {getAgeGroupLabel(user?.ageGroup)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                  好みのスタイル
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                  {getStylePreferenceLabel(user?.stylePreference)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* 活動情報 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            活動
          </Text>
          <Card variant="outlined">
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToFavorites}
            >
              <Ionicons name="heart-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                お気に入り
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToSwipeHistory}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                スワイプ履歴
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* 設定メニュー */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            設定
          </Text>
          <Card variant="outlined">
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToSettings}
            >
              <Ionicons name="settings-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                アカウント設定
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToHelp}
            >
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                ヘルプ・サポート
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* 開発環境のみ表示されるデバッグセクション */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              開発者ツール
            </Text>
            <Card variant="outlined">
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowDebugModal(true)}
              >
                <Ionicons name="bug-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                    商品統計情報
                  </Text>
                  <Text style={[styles.menuItemSubtext, { color: theme.colors.text.secondary }]}>
                    データベースの商品数を確認
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* ログアウトボタン */}
        <View style={styles.logoutSection}>
          <Button
            variant="outline"
            isFullWidth
            onPress={handleLogout}
            isLoading={loading}
          >
            ログアウト
          </Button>
        </View>
      </ScrollView>

      {/* デバッグモーダル */}
      {__DEV__ && (
        <Modal
          visible={showDebugModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowDebugModal(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                デバッグツール
              </Text>
              <TouchableOpacity onPress={() => setShowDebugModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* 商品統計情報 */}
              <View style={styles.debugSection}>
                <Text style={[styles.debugSectionTitle, { color: theme.colors.text.primary }]}>
                  商品統計情報
                </Text>
                <Text style={{ color: theme.colors.text.secondary, fontSize: 14 }}>
                  デバッグ機能は一時的に無効化されています
                </Text>
              </View>
              
              {/* デバッグツールリンク */}
              <View style={styles.debugSection}>
                <Text style={[styles.debugSectionTitle, { color: theme.colors.text.primary }]}>
                  診断ツール
                </Text>
                
                <TouchableOpacity
                  style={[styles.debugButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setShowDebugModal(false);
                    navigation.navigate('Admin');
                  }}
                >
                  <Ionicons name="settings-outline" size={20} color="white" />
                  <Text style={styles.debugButtonText}>管理画面</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* 開発メニュー */}
      {showDevMenu && (
        <DevMenu onClose={() => setShowDevMenu(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: -16,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  debugSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  debugSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProfileScreen;
