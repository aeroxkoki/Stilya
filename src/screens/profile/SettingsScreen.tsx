import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  StyleSheet, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { StyleType, styleThemes } from '@/styles/theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme, isDarkMode, toggleDarkMode, styleType, setStyleType } = useStyle();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // パスワード変更関連の状態
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // スタイル選択関連の状態
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(styleType);
  
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
  
  // スタイル選択の処理
  const handleStyleSelect = (style: StyleType) => {
    setSelectedStyle(style);
  };
  
  // スタイル保存処理
  const handleSaveStyle = () => {
    setStyleType(selectedStyle);
    setShowStyleModal(false);
  };
  
  // ログアウト処理
  const handleSignOut = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);
      Alert.alert('エラー', 'ログアウト処理に失敗しました');
    }
  };
  
  // スタイル名の取得
  const getStyleName = (style: StyleType): string => {
    switch (style) {
      case 'minimal': return 'ミニマル';
      case 'natural': return 'ナチュラル';
      case 'bold': return 'ボールド';
      default: return '';
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>設定</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* アカウント設定セクション */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: styleThemes[styleType].colors.primary }]}>アカウント</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>メールアドレス</Text>
              <Text style={[styles.settingValue, { color: isDarkMode ? '#ccc' : '#555' }]}>{user?.email || '未設定'}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
            onPress={() => setShowPasswordFields(!showPasswordFields)}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>パスワード変更</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                セキュリティのために定期的な変更をおすすめします
              </Text>
            </View>
            <Ionicons
              name={showPasswordFields ? "chevron-up" : "chevron-down"}
              size={20}
              color={isDarkMode ? '#aaa' : '#999'}
            />
          </TouchableOpacity>
          
          {showPasswordFields && (
            <View style={styles.passwordFields}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                  color: isDarkMode ? '#fff' : '#333' 
                }]}
                placeholder="現在のパスワード"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                  color: isDarkMode ? '#fff' : '#333' 
                }]}
                placeholder="新しいパスワード"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              />
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                  color: isDarkMode ? '#fff' : '#333' 
                }]}
                placeholder="新しいパスワード（確認）"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: styleThemes[styleType].colors.primary }]}
                onPress={handleSavePassword}
              >
                <Text style={styles.saveButtonText}>変更を保存</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* アプリ設定セクション */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: styleThemes[styleType].colors.primary }]}>アプリ設定</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>ダークモード</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                画面を暗めの配色に切り替えます
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#e0e0e0", true: styleThemes[styleType].colors.primary }}
              thumbColor={isDarkMode ? "#fff" : "#f8f8f8"}
            />
          </View>
          
          {/* UIスタイル設定 */}
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
            onPress={() => setShowStyleModal(true)}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>UIスタイル</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                アプリの見た目のテーマを変更します
              </Text>
            </View>
            <View style={styles.settingValueContainer}>
              <Text style={[
                styles.settingStyleValue, 
                { color: styleThemes[styleType].colors.primary }
              ]}>
                {getStyleName(styleType)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
            </View>
          </TouchableOpacity>
          
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>プッシュ通知</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                お気に入りアイテムの値下げなどをお知らせします
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => setPushNotifications(value)}
              trackColor={{ false: "#e0e0e0", true: styleThemes[styleType].colors.primary }}
              thumbColor={pushNotifications ? "#fff" : "#f8f8f8"}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>メール通知</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                おすすめ商品やセール情報をメールでお知らせします
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => setEmailNotifications(value)}
              trackColor={{ false: "#e0e0e0", true: styleThemes[styleType].colors.primary }}
              thumbColor={emailNotifications ? "#fff" : "#f8f8f8"}
            />
          </View>
        </View>
        
        {/* サポートセクション */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: styleThemes[styleType].colors.primary }]}>サポート</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>ヘルプ &amp; よくある質問</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                アプリの使い方やトラブルシューティング
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>お問い合わせ</Text>
              <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                サポートチームにご連絡ください
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>利用規約</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          {/* データベース診断（開発用） */}
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
              onPress={() => navigation.navigate('SupabaseDiagnostic' as never)}
            >
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>データベース診断</Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                  開発用：接続状態を確認します
                </Text>
              </View>
              <Ionicons name="bug-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* ログアウトボタン */}
        <TouchableOpacity
          style={[
            styles.signOutButton, 
            { 
              backgroundColor: isDarkMode ? '#333' : '#f8f8f8',
              borderColor: isDarkMode ? '#444' : '#e0e0e0' 
            }
          ]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>ログアウト</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: isDarkMode ? '#777' : '#999' }]}>Stilya バージョン 1.0.0</Text>
        </View>
      </ScrollView>
      
      {/* スタイル選択モーダル */}
      <Modal
        visible={showStyleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStyleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: isDarkMode ? '#222' : '#fff',
              borderRadius: styleThemes[styleType].radius.m
            }
          ]}>
            <Text style={[
              styles.modalTitle, 
              { color: isDarkMode ? '#fff' : '#333' }
            ]}>
              UIスタイルの選択
            </Text>
            
            {(['minimal', 'natural', 'bold'] as StyleType[]).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleOption,
                  { 
                    backgroundColor: selectedStyle === style 
                      ? `${styleThemes[style].colors.primary}20` 
                      : isDarkMode ? '#333' : '#f5f5f5',
                    borderColor: selectedStyle === style 
                      ? styleThemes[style].colors.primary 
                      : 'transparent',
                    borderRadius: styleThemes[style].radius.m
                  }
                ]}
                onPress={() => handleStyleSelect(style)}
              >
                <View style={styles.styleOptionContent}>
                  <View style={[
                    styles.styleColorSample,
                    {
                      backgroundColor: styleThemes[style].colors.primary,
                      borderRadius: styleThemes[style].radius.s
                    }
                  ]} />
                  <View style={styles.styleTextContainer}>
                    <Text style={[
                      styles.styleOptionName,
                      { 
                        color: isDarkMode ? '#fff' : '#333',
                        fontWeight: selectedStyle === style ? 'bold' : 'normal'
                      }
                    ]}>
                      {getStyleName(style)}
                    </Text>
                    <Text style={[
                      styles.styleOptionDescription,
                      { color: isDarkMode ? '#aaa' : '#777' }
                    ]}>
                      {style === 'minimal'
                        ? 'シャープでモダンなデザイン'
                        : style === 'natural'
                        ? '柔らかく温かみのあるデザイン'
                        : '大胆で鮮やかなデザイン'}
                    </Text>
                  </View>
                  
                  {selectedStyle === style && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={styleThemes[style].colors.primary} 
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStyleModal(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  { backgroundColor: styleThemes[selectedStyle].colors.primary }
                ]}
                onPress={handleSaveStyle}
              >
                <Text style={styles.confirmButtonText}>適用</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  },
  settingValue: {
    fontSize: 14,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingStyleValue: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '500',
  },
  passwordFields: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
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
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  styleOption: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 2,
  },
  styleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleColorSample: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  styleTextContainer: {
    flex: 1,
  },
  styleOptionName: {
    fontSize: 16,
    marginBottom: 2,
  },
  styleOptionDescription: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#777',
    fontSize: 16,
  },
  confirmButton: {
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;