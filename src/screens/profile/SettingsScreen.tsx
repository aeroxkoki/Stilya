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
import { cleanupDuplicateSwipes } from '@/services/swipeService';
import { runDatabaseDiagnostics, cleanupInvalidProducts } from '@/utils/diagnostics';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme, isDarkMode, toggleDarkMode, styleType, setStyleType } = useStyle();
  
  // パスワード変更関連の状態
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // スタイル選択関連の状態
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(styleType);
  
  // パスワード保存処理
  const handleSavePassword = async () => {
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
    
    try {
      // AuthServiceを使用してパスワードを更新
      const { AuthService } = await import('@/services/authService');
      const result = await AuthService.updatePassword(currentPassword, newPassword);
      
      if (result.success) {
        Alert.alert('成功', 'パスワードを変更しました');
        setShowPasswordFields(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('エラー', result.error || 'パスワードの変更に失敗しました');
      }
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      Alert.alert('エラー', 'パスワードの変更に失敗しました');
    }
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
  
  // データクリーンアップ処理
  const handleCleanupData = async () => {
    if (!user) return;
    
    Alert.alert(
      'データのクリーンアップ',
      'スワイプ履歴の重複データを削除します。この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cleanupDuplicateSwipes(user.id);
              if (success) {
                Alert.alert('完了', 'データのクリーンアップが完了しました。');
              } else {
                Alert.alert('エラー', 'クリーンアップ処理中にエラーが発生しました。');
              }
            } catch (error) {
              console.error('Cleanup error:', error);
              Alert.alert('エラー', 'クリーンアップ処理に失敗しました。');
            }
          }
        }
      ]
    );
  };
  
  // データベース整合性診断処理
  const handleDatabaseDiagnostics = async () => {
    Alert.alert(
      'データベース診断',
      'データベースの整合性をチェックします。コンソールログを確認してください。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          onPress: async () => {
            try {
              console.log('Starting database diagnostics...');
              await runDatabaseDiagnostics();
              Alert.alert('完了', 'データベース診断が完了しました。コンソールログを確認してください。');
            } catch (error) {
              console.error('Diagnostics error:', error);
              Alert.alert('エラー', '診断中にエラーが発生しました。');
            }
          }
        }
      ]
    );
  };
  
  // 不正データのクリーンアップ処理
  const handleInvalidDataCleanup = async () => {
    Alert.alert(
      '不正データのクリーンアップ',
      '不完全な商品データを削除します。この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          style: 'destructive',
          onPress: async () => {
            try {
              await cleanupInvalidProducts();
              Alert.alert('完了', '不正データのクリーンアップが完了しました。');
            } catch (error) {
              console.error('Invalid data cleanup error:', error);
              Alert.alert('エラー', 'クリーンアップ処理に失敗しました。');
            }
          }
        }
      ]
    );
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
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>プライバシーポリシー</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
            onPress={() => navigation.navigate('TermsOfService' as never)}
          >
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>利用規約</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#aaa' : '#999'} />
          </TouchableOpacity>
          
          {/* データベース診断（開発用） */}
          {__DEV__ && (
            <>
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={() => navigation.navigate('SupabaseDiagnostic' as never)}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>データベース診断画面</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    開発用：接続状態を視覚的に確認します
                  </Text>
                </View>
                <Ionicons name="bug-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              
              {/* 画像デバッグ機能は一時的にコメントアウト - 画面が未実装のため
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={() => navigation.navigate('ImageDebug')}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>画像デバッグ</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    開発用：画像URLの最適化状態を確認します
                  </Text>
                </View>
                <Ionicons name="image-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={() => navigation.navigate('ImageDiagnosis')}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>画像表示診断</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    開発用：実機での画像表示問題を診断・修正
                  </Text>
                </View>
                <Ionicons name="medkit-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              */}
              
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={handleDatabaseDiagnostics}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>データベース整合性チェック</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    商品データの整合性をチェックします
                  </Text>
                </View>
                <Ionicons name="analytics-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={handleCleanupData}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>スワイプ履歴のクリーンアップ</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    重複したスワイプデータを削除します
                  </Text>
                </View>
                <Ionicons name="refresh-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={() => navigation.navigate('Admin' as never)}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#333' }]}>管理画面</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    楽天商品データの管理と更新
                  </Text>
                </View>
                <Ionicons name="settings-outline" size={20} color={isDarkMode ? '#aaa' : '#999'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }]}
                onPress={handleInvalidDataCleanup}
              >
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: '#ff6b6b' }]}>不正商品データのクリーンアップ</Text>
                  <Text style={[styles.settingDescription, { color: isDarkMode ? '#aaa' : '#777' }]}>
                    不完全な商品データを削除します（危険）
                  </Text>
                </View>
                <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </>
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