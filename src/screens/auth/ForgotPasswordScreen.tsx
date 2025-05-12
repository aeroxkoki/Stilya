import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { supabase } from '@/services/supabase';
import { AuthStackParamList } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://example.com/reset-password', // 実際のリダイレクトURLに変更する必要があります
      });

      if (error) throw error;
      
      setEmailSent(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'パスワードリセットリクエストの送信中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-10 flex-1 justify-center">
            {/* ヘッダー */}
            <TouchableOpacity 
              className="absolute top-12 left-4 z-10" 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            {/* タイトル */}
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-gray-800">パスワードをリセット</Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-4">
                アカウントに登録されているメールアドレスを入力してください。パスワードリセット用のリンクを送信します。
              </Text>
            </View>

            {emailSent ? (
              // メール送信済み画面
              <View className="items-center">
                <View className="bg-green-100 p-4 rounded-full mb-4">
                  <Ionicons name="checkmark" size={40} color="#10B981" />
                </View>
                <Text className="text-lg font-medium text-center mb-2">
                  リセット用メールを送信しました
                </Text>
                <Text className="text-gray-500 text-center mb-8">
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
                {error && (
                  <View className="mb-4 p-3 bg-red-50 rounded-md">
                    <Text className="text-red-500">{error}</Text>
                  </View>
                )}

                {/* 入力フォーム */}
                <View className="space-y-4">
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
                  className="mt-6"
                >
                  リセットリンクを送信
                </Button>

                {/* ログインリンク */}
                <View className="flex-row justify-center mt-8">
                  <Text className="text-gray-600">パスワードを思い出しましたか？</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-primary-dark font-medium ml-1">
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
