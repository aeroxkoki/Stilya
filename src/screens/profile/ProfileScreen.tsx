import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Card } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { ProfileStackParamList } from '@/types';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, loading } = useAuth();
  const { 
    favorites,
    swipeHistory,
    getFavorites,
    getSwipeHistory
  } = useProducts();

  // 初回表示時にデータを取得
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // お気に入りとスワイプ履歴を取得
        await Promise.all([
          getFavorites(user.id),
          getSwipeHistory(user.id)
        ]);
      }
    };
    
    loadData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  return (
    <SafeAreaView >
      <ScrollView >
        {/* ヘッダー */}
        <View >
          <Text >マイページ</Text>
        </View>

        {/* プロフィール情報 */}
        <View >
          <Card >
            <View >
              <View >
                <Text >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text >{user?.email || 'ユーザー'}</Text>
            </View>

            <View >
              <View >
                <Text >性別</Text>
                <Text >
                  {user?.gender ? genderMap[user.gender] || user.gender : '未設定'}
                </Text>
              </View>
              <View >
                <Text >年代</Text>
                <Text >{user?.ageGroup || '未設定'}</Text>
              </View>
              <View >
                <Text >登録日</Text>
                <Text >
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('ja-JP')
                    : '不明'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* アクティビティ */}
        <View >
          <Text >アクティビティ</Text>
          <Card variant="outlined" >
            <TouchableOpacity 
              
              onPress={handleNavigateToFavorites}
            >
              <Ionicons name="heart-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <View >
                <Text >お気に入り</Text>
                <Text >{favorites.length}件の商品</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              
              onPress={handleNavigateToSwipeHistory}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <View >
                <Text >スワイプ履歴</Text>
                <Text >{swipeHistory.length}件のスワイプ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* 設定メニュー */}
        <View >
          <Text >設定</Text>
          <Card variant="outlined" >
            <TouchableOpacity 
              
              onPress={handleNavigateToSettings}
            >
              <Ionicons name="settings-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text >アカウント設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              
              onPress={handleNavigateToHelp}
            >
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text >ヘルプ・サポート</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* ログアウトボタン */}
        <View >
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

export default ProfileScreen;