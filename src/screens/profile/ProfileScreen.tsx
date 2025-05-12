import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/common';
import { useAuthStore } from '@/store/authStore';

const ProfileScreen: React.FC = () => {
  const { user, logout, loading } = useAuthStore();

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* ヘッダー */}
        <View className="px-6 pt-10 pb-6">
          <Text className="text-2xl font-bold">マイページ</Text>
        </View>

        {/* プロフィール情報 */}
        <View className="px-6 mb-6">
          <Card className="p-4">
            <View className="items-center mb-4">
              <View className="bg-primary h-20 w-20 rounded-full items-center justify-center mb-2">
                <Text className="text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text className="text-lg font-bold">{user?.email || 'ユーザー'}</Text>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">性別</Text>
                <Text className="font-medium">
                  {user?.gender ? genderMap[user.gender] || user.gender : '未設定'}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">年代</Text>
                <Text className="font-medium">{user?.ageGroup || '未設定'}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">登録日</Text>
                <Text className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('ja-JP')
                    : '不明'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* メニュー */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-3">設定</Text>
          <Card variant="outlined" className="p-0 divide-y divide-gray-100">
            <TouchableOpacity className="p-4 flex-row items-center">
              <Ionicons name="heart-outline" size={20} color="#6B7280" className="mr-3" />
              <Text className="flex-1">お気に入り</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#6B7280" className="mr-3" />
              <Text className="flex-1">アカウント設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="p-4 flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" className="mr-3" />
              <Text className="flex-1">ヘルプ・サポート</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* ログアウトボタン */}
        <View className="px-6 mb-10">
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
