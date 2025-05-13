import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile, loading } = useAuthStore();
  const { clearFavorites } = useProductStore();
  
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
  
  // プロフィール編集モーダル
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [nickname, setNickname] = useState<string>('');
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 初期値の設定
  useEffect(() => {
    if (user) {
      setGender(user.gender || 'other');
      setAgeGroup(user.ageGroup || '');
      setNickname(user.nickname || user.email?.split('@')[0] || '');
    }
  }, [user]);
  
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
  
  // プロフィール保存
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        nickname: nickname.trim()
      });
      
      setIsEditModalVisible(false);
      
      Alert.alert(
        'プロフィールを更新しました',
        'プロフィール情報が正常に保存されました。',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'エラー',
        'プロフィールの更新に失敗しました。もう一度お試しください。',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };
  
  // パスワード変更
  const handleChangePassword = () => {
    // パスワード変更フォームの表示切替
    setShowChangePasswordForm(!showChangePasswordForm);
    
    // フォームが閉じられたら入力値をクリア
    if (showChangePasswordForm) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  
  // パスワード変更実行
  const handleSavePassword = () => {
    // 入力チェック
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください。');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('エラー', '新しいパスワードと確認用パスワードが一致しません。');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上である必要があります。');
      return;
    }
    
    // MVP版では未実装のためアラートのみ表示
    Alert.alert(
      '機能制限',
      'パスワード変更機能はMVP版では実装されていません。',
      [{ text: 'OK', style: 'default' }]
    );
    
    // フォームをクリア
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePasswordForm(false);
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
      '実行する操作を選択してください。',
      [
        { 
          text: 'お気に入りをクリア', 
          onPress: () => {
            Alert.alert(
              'お気に入りをクリア',
              'すべてのお気に入りを削除してもよろしいですか？\n\nこの操作は元に戻せません。',
              [
                { text: 'キャンセル', style: 'cancel' },
                { 
                  text: 'クリア', 
                  style: 'destructive',
                  onPress: () => {
                    if (user) {
                      // MVP段階では仮実装
                      clearFavorites(user.id);
                      Alert.alert(
                        '完了',
                        'お気に入りをクリアしました。',
                        [{ text: 'OK', style: 'default' }]
                      );
                    }
                  }
                }
              ]
            );
          }
        },
        { 
          text: 'スワイプ履歴をクリア', 
          onPress: () => {
            Alert.alert(
              '機能制限',
              'この機能はMVP版では実装されていません。',
              [{ text: 'OK', style: 'default' }]
            );
          }
        },
        { 
          text: 'アカウントデータをダウンロード', 
          onPress: () => {
            Alert.alert(
              '機能制限',
              'この機能はMVP版では実装されていません。',
              [{ text: 'OK', style: 'default' }]
            );
          }
        },
        { text: 'キャンセル', style: 'cancel' }
      ]
    );
  };
  
  // アカウント削除確認
  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除すると、すべてのデータが完全に削除され、復元できなくなります。\n\n本当にアカウントを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '機能制限',
              'この機能はMVP版では実装されていません。',
              [{ text: 'OK', style: 'default' }]
            );
          }
        }
      ]
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
            {/* プロフィール情報 */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-500 mb-1">メールアドレス</Text>
                <Text className="font-medium">{user?.email || '未設定'}</Text>
              </View>
              <TouchableOpacity 
                className="bg-blue-50 p-2 rounded"
                onPress={() => setIsEditModalVisible(true)}
              >
                <Text className="text-blue-500">編集</Text>
              </TouchableOpacity>
            </View>
            
            {/* パスワード変更 */}
            <TouchableOpacity 
              className="flex-row items-center justify-between mb-4"
              onPress={handleChangePassword}
            >
              <View>
                <Text className="text-gray-500 mb-1">パスワード</Text>
                <Text className="font-medium">••••••••</Text>
              </View>
              <View className="bg-blue-50 p-2 rounded">
                <Text className="text-blue-500">変更</Text>
              </View>
            </TouchableOpacity>
            
            {/* パスワード変更フォーム */}
            {showChangePasswordForm && (
              <View className="mb-4 bg-gray-50 p-3 rounded">
                <Input 
                  label="現在のパスワード"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="現在のパスワード"
                  secureTextEntry
                  className="mb-2"
                />
                <Input 
                  label="新しいパスワード"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="新しいパスワード（6文字以上）"
                  secureTextEntry
                  className="mb-2"
                />
                <Input 
                  label="新しいパスワード（確認用）"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="新しいパスワードをもう一度入力"
                  secureTextEntry
                  className="mb-3"
                />
                <Button
                  size="sm"
                  onPress={handleSavePassword}
                >
                  パスワードを変更
                </Button>
              </View>
            )}
            
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
            
            <Button onPress={handleSaveSettings}>
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
        <View className="px-6 mb-6">
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
        
        {/* アカウント削除ボタン */}
        <View className="px-6 mb-10">
          <TouchableOpacity
            className="p-4 border border-red-200 rounded items-center"
            onPress={handleDeleteAccount}
          >
            <Text className="text-red-500">アカウントを削除</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* プロフィール編集モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">プロフィール編集</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Input
              label="ニックネーム"
              value={nickname}
              onChangeText={setNickname}
              placeholder="ニックネームを入力"
              className="mb-4"
            />
            
            <Text className="text-gray-500 mb-1">メールアドレス（変更不可）</Text>
            <View className="p-2 bg-gray-100 rounded mb-4">
              <Text>{user?.email || '未設定'}</Text>
            </View>
            
            <Button
              isFullWidth
              onPress={handleSaveProfile}
            >
              保存
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SettingsScreen;