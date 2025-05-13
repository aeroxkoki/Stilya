import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '@/components/common';
import { useAuthStore } from '@/store/authStore';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile, loading } = useAuthStore();
  
  // フォーム状態
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    user?.gender || 'other'
  );
  const [ageGroup, setAgeGroup] = useState<string>(user?.ageGroup || '');
  
  // 通知設定（MVP段階では機能しないダミー）
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    recommendations: true
  });
  
  // プライバシー設定（MVP段階では機能しないダミー）
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showHistory: false
  });
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // 設定保存
  const handleSaveSettings = async () => {
    try {
      await updateProfile({
        gender,
        ageGroup
      });
      
      Alert.alert(
        '設定を保存しました',
        '設定が正常に保存されました。',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'エラー',
        '設定の保存に失敗しました。もう一度お試しください。',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };
  
  // 年代選択オプション
  const ageGroups = [
    '10代', '20代前半', '20代後半', '30代前半', '30代後半', 
    '40代', '50代以上'
  ];
  
  // 各種設定を開く
  const handleOpenNotificationSettings = () => {
    Alert.alert(
      '通知設定',
      'この機能はMVP版では実装されていません。',
      [{ text: 'OK', style: 'default' }]
    );
  };
  
  const handleOpenPrivacySettings = () => {
    Alert.alert(
      'プライバシー設定',
      'この機能はMVP版では実装されていません。',
      [{ text: 'OK', style: 'default' }]
    );
  };
  
  const handleOpenDataSettings = () => {
    Alert.alert(
      'データ管理',
      'この機能はMVP版では実装されていません。\n\n将来的には、スワイプ履歴のクリアや、お気に入りの一括管理などができるようになる予定です。',
      [{ text: 'OK', style: 'default' }]
    );
  };
  
  // ローディング表示
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-6 pt-10 pb-4">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">設定</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* ヘッダー */}
        <View className="flex-row items-center px-6 pt-10 pb-4">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">設定</Text>
        </View>
        
        {/* アカウント設定 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-3">アカウント設定</Text>
          <Card className="p-4">
            <Text className="text-gray-500 mb-2">メールアドレス</Text>
            <View className="p-2 bg-gray-100 rounded mb-4">
              <Text>{user?.email || '未設定'}</Text>
            </View>
            
            <Text className="text-gray-500 mb-2">性別</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`flex-1 p-2 rounded mr-2 ${gender === 'male' ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}
                onPress={() => setGender('male')}
              >
                <Text className={`text-center ${gender === 'male' ? 'text-blue-600 font-medium' : ''}`}>男性</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-2 rounded mr-2 ${gender === 'female' ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}
                onPress={() => setGender('female')}
              >
                <Text className={`text-center ${gender === 'female' ? 'text-blue-600 font-medium' : ''}`}>女性</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-2 rounded ${gender === 'other' ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}
                onPress={() => setGender('other')}
              >
                <Text className={`text-center ${gender === 'other' ? 'text-blue-600 font-medium' : ''}`}>その他</Text>
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-500 mb-2">年代</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {ageGroups.map((age) => (
                <TouchableOpacity
                  key={age}
                  className={`p-2 px-4 rounded mr-2 ${ageGroup === age ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'}`}
                  onPress={() => setAgeGroup(age)}
                >
                  <Text className={`${ageGroup === age ? 'text-blue-600 font-medium' : ''}`}>{age}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Button
              onPress={handleSaveSettings}
            >
              保存する
            </Button>
          </Card>
        </View>
        
        {/* 通知設定 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-3">通知設定</Text>
          <Card variant="outlined" className="p-0 divide-y divide-gray-100">
            <View className="p-4 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium">プッシュ通知</Text>
                <Text className="text-xs text-gray-500">新商品やお得な情報をお知らせ</Text>
              </View>
              <Switch
                value={notifications.push}
                onValueChange={(value) => 
                  setNotifications({ ...notifications, push: value })
                }
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifications.push ? '#3B82F6' : '#f4f3f4'}
              />
            </View>
            
            <View className="p-4 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium">メール通知</Text>
                <Text className="text-xs text-gray-500">セール情報やお知らせメール</Text>
              </View>
              <Switch
                value={notifications.email}
                onValueChange={(value) => 
                  setNotifications({ ...notifications, email: value })
                }
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifications.email ? '#3B82F6' : '#f4f3f4'}
              />
            </View>
            
            <View className="p-4 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium">おすすめ商品通知</Text>
                <Text className="text-xs text-gray-500">あなたの好みに合った商品をお知らせ</Text>
              </View>
              <Switch
                value={notifications.recommendations}
                onValueChange={(value) => 
                  setNotifications({ ...notifications, recommendations: value })
                }
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifications.recommendations ? '#3B82F6' : '#f4f3f4'}
              />
            </View>
            
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={handleOpenNotificationSettings}
            >
              <Text className="flex-1 text-blue-500">詳細設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* その他の設定 */}
        <View className="px-6 mb-10">
          <Text className="text-lg font-bold mb-3">その他の設定</Text>
          <Card variant="outlined" className="p-0 divide-y divide-gray-100">
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={handleOpenPrivacySettings}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text className="flex-1">プライバシー設定</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={handleOpenDataSettings}
            >
              <Ionicons name="server-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text className="flex-1">データ管理</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={() => 
                Alert.alert(
                  'アプリについて',
                  'Stilya\nVersion: 0.1.0 (MVP)\n\n© 2025 Stilya Team',
                  [{ text: 'OK', style: 'default' }]
                )
              }
            >
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              <Text className="flex-1">アプリについて</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;