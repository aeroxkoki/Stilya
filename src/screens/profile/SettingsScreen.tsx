import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  StyleSheet, 
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signOut, user } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // パスワード変更関連の状態
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // パスワード保存処理
  const handleSavePassword = () => {
    if (!currentPassword) {
      Alert.alert('エラー', '現在のパスワードを入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('エラー', '新しいパスワードと確認用パスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('エラー', 'パスワードは8文字以上で設定してください');
      return;
    }
    
    // TODO: パスワード変更APIを呼び出す
    Alert.alert('成功', 'パスワードを変更しました');
    setShowPasswordFields(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  // ログアウト処理
  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);
      Alert.alert('エラー', 'ログアウト処理に失敗しました');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>設定</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* アカウント設定セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アカウント</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>メールアドレス</Text>
              <Text style={styles.settingValue}>{user?.email || '未設定'}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>パスワード変更</Text>
              <Text style={styles.settingDescription}>
                セキュリティのために定期的な変更をおすすめします
              </Text>
            </View>
            <Ionicons
              name={showPasswordFields ? "chevron-up" : "chevron-down"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
          
          {showPasswordFields && (
            <View style={styles.passwordFields}>
              <TextInput
                style={styles.input}
                placeholder="現在のパスワード"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="新しいパスワード"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="新しいパスワード（確認）"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePassword}
              >
                <Text style={styles.saveButtonText}>変更を保存</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* アプリ設定セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ設定</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>ダークモード</Text>
              <Text style={styles.settingDescription}>
                画面を暗めの配色に切り替えます
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => setDarkMode(value)}
              trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
              thumbColor={darkMode ? "#fff" : "#f8f8f8"}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>プッシュ通知</Text>
              <Text style={styles.settingDescription}>
                お気に入りアイテムの値下げなどをお知らせします
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => setPushNotifications(value)}
              trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
              thumbColor={pushNotifications ? "#fff" : "#f8f8f8"}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>メール通知</Text>
              <Text style={styles.settingDescription}>
                おすすめ商品やセール情報をメールでお知らせします
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => setEmailNotifications(value)}
              trackColor={{ false: "#e0e0e0", true: "#3b82f6" }}
              thumbColor={emailNotifications ? "#fff" : "#f8f8f8"}
            />
          </View>
        </View>
        
        {/* サポートセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サポート</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>ヘルプ &amp; よくある質問</Text>
              <Text style={styles.settingDescription}>
                アプリの使い方やトラブルシューティング
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>お問い合わせ</Text>
              <Text style={styles.settingDescription}>
                サポートチームにご連絡ください
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>利用規約</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        {/* ログアウトボタン */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>ログアウト</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Stilya バージョン 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#3b82f6',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#777',
  },
  settingValue: {
    fontSize: 14,
    color: '#555',
  },
  passwordFields: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  signOutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  }
});

export default SettingsScreen;
