import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/types';
import { formatErrorMessage } from '@/utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetUserPassword, error: storeError, loading, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // storeエラーが変更されたらvalidationErrorを設定
  useEffect(() => {
    if (storeError) {
      setValidationError(storeError);
    }
  }, [storeError]);

  // コンポーネントがアンマウントされた時にエラーをクリア
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleResetPassword = async () => {
    // バリデーション
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError('有効なメールアドレスを入力してください');
      return;
    }

    setValidationError(null);
    
    try {
      await resetUserPassword(email);
      
      // エラーがなければメール送信成功
      if (!storeError) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* ヘッダー */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            {/* タイトル */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>パスワードをリセット</Text>
              <Text style={styles.subtitle}>
                アカウントに登録されているメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
              </Text>
            </View>

            {emailSent ? (
              // メール送信済み画面
              <View style={styles.successContainer}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark" size={40} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>
                  リセット用メールを送信しました
                </Text>
                <Text style={styles.successMessage}>
                  {email} にパスワードリセット用のリンクを送信しました。メールをご確認ください。
                </Text>
                <Button
                  onPress={() => navigation.navigate('Login')}
                  variant="primary"
                >
                  ログイン画面に戻る
                </Button>
              </View>
            ) : (
              // パスワードリセットフォーム
              <>
                {/* エラーメッセージ */}
                {validationError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{formatErrorMessage(validationError)}</Text>
                  </View>
                )}

                {/* 入力フォーム */}
                <View style={styles.formContainer}>
                  <Input
                    label="メールアドレス"
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
                  />
                </View>

                {/* 送信ボタン */}
                <Button
                  isFullWidth
                  onPress={handleResetPassword}
                  isLoading={loading}
                  style={styles.submitButton}
                >
                  リセットリンクを送信
                </Button>

                {/* ログインリンク */}
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLinkText}>パスワードを思い出しましたか？</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>
                      ログイン
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 24,
  },
  submitButton: {
    marginBottom: 24,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;