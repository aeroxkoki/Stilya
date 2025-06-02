import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
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
    <SafeAreaView >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View >
            {/* ヘッダー */}
            <TouchableOpacity 
               
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            {/* タイトル */}
            <View >
              <Text >パスワードをリセット</Text>
              <Text >
                アカウントに登録されているメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
              </Text>
            </View>

            {emailSent ? (
              // メール送信済み画面
              <View >
                <View >
                  <Ionicons name="checkmark" size={40} color="#10B981" />
                </View>
                <Text >
                  リセット用メールを送信しました
                </Text>
                <Text >
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
                  <View >
                    <Text >{formatErrorMessage(validationError)}</Text>
                  </View>
                )}

                {/* 入力フォーム */}
                <View >
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
                  
                >
                  リセットリンクを送信
                </Button>

                {/* ログインリンク */}
                <View >
                  <Text >パスワードを思い出しましたか？</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text >
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
