import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useProductStore } from '@/store/productStore';
import { ProfileStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, loading } = useAuth();
  const { theme } = useStyle();
  const { 
    favorites,
    swipeHistory,
    getFavorites,
    getSwipeHistory
  } = useProductStore();
  
  // 動的スタイルを生成
  const dynamicStyles = {
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: theme.colors.background,
    },
  };

  // 初回表示時にデータを取得
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // お気に入りとスワイプ履歴を取得
          await Promise.all([
            getFavorites(user.id),
            getSwipeHistory(user.id)
          ]);
        } catch (error) {
          console.error('データ取得エラー:', error);
        }
      }
    };
    
    loadData();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          }
        }
      ]
    );
  };

  // 性別のマッピング
  const genderMap: Record<string, string> = {
    male: '男性',
    female: '女性',
    other: 'その他',
  };
  
  // 各画面への遷移
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
    // MVPでは簡易的にアラートを表示
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            マイページ
          </Text>
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
                  年代
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                  {user?.ageGroup || '未設定'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
                  登録日
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('ja-JP')
                    : '不明'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* アクティビティ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            アクティビティ
          </Text>
          <Card variant="outlined">
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToFavorites}
            >
              <Ionicons name="heart-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                  お気に入り
                </Text>
                <Text style={[styles.menuItemSubtext, { color: theme.colors.text.secondary }]}>
                  {favorites.length}件の商品
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNavigateToSwipeHistory}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                  スワイプ履歴
                </Text>
                <Text style={[styles.menuItemSubtext, { color: theme.colors.text.secondary }]}>
                  {swipeHistory.length}件のスワイプ
                </Text>
              </View>
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
});

export default ProfileScreen;