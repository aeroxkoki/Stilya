import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/types';
import { formatErrorMessage } from '@/utils';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { resetUserPassword, error: storeError, loading, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { theme } = useStyle();

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

  // 動的スタイル
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
    },
    successIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.success + '20',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginBottom: 16,
      textAlign: 'center' as const,
    },
    successMessage: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center' as const,
      marginBottom: 32,
      lineHeight: 24,
    },
    errorContainer: {
      backgroundColor: theme.colors.error + '20',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
    },
    formContainer: {
      marginBottom: 24,
    },
    submitButton: {
      marginBottom: 24,
    },
    loginLinkContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    loginLinkText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginRight: 4,
    },
    loginLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600' as const,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dynamicStyles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={dynamicStyles.content}>
            {/* ヘッダー */}
            <TouchableOpacity 
              style={dynamicStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            
            {/* タイトル */}
            <View style={dynamicStyles.titleContainer}>
              <Text style={dynamicStyles.title}>パスワードをリセット</Text>
              <Text style={dynamicStyles.subtitle}>
                アカウントに登録されているメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
              </Text>
            </View>

            {emailSent ? (
              // メール送信済み画面
              <View style={dynamicStyles.successContainer}>
                <View style={dynamicStyles.successIconContainer}>
                  <Ionicons name="checkmark" size={40} color={theme.colors.success} />
                </View>
                <Text style={dynamicStyles.successTitle}>
                  リセット用メールを送信しました
                </Text>
                <Text style={dynamicStyles.successMessage}>
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
                  <View style={dynamicStyles.errorContainer}>
                    <Text style={dynamicStyles.errorText}>{formatErrorMessage(validationError)}</Text>
                  </View>
                )}

                {/* 入力フォーム */}
                <View style={dynamicStyles.formContainer}>
                  <Input
                    label="メールアドレス"
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />}
                  />
                </View>

                {/* 送信ボタン */}
                <Button
                  isFullWidth
                  onPress={handleResetPassword}
                  isLoading={loading}
                  style={dynamicStyles.submitButton}
                >
                  リセットリンクを送信
                </Button>

                {/* ログインリンク */}
                <View style={dynamicStyles.loginLinkContainer}>
                  <Text style={dynamicStyles.loginLinkText}>パスワードを思い出しましたか？</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={dynamicStyles.loginLink}>
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

export default ForgotPasswordScreen;