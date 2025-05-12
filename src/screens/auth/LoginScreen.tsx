import React, { useState } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/types';
import { formatErrorMessage } from '@/utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // メールアドレスのバリデーション
    if (!email) {
      errors.email = 'メールアドレスを入力してください';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
      isValid = false;
    }

    // パスワードのバリデーション
    if (!password) {
      errors.password = 'パスワードを入力してください';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'パスワードは6文字以上である必要があります';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      // 認証成功は、App.tsxで処理されるため、ここでのナビゲーションは不要
    } catch (error) {
      console.error('Login error:', error);
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
            {/* ロゴ */}
            <View className="items-center mb-8">
              <Image
                source={require('@/assets/logo-placeholder.png')}
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-gray-800">Stilya</Text>
              <Text className="text-sm text-gray-500 mt-1">スワイプで、あなたの"好き"が見つかる。</Text>
            </View>

            {/* エラーメッセージ */}
            {error && (
              <View className="mb-4 p-3 bg-red-50 rounded-md">
                <Text className="text-red-500">{formatErrorMessage(error)}</Text>
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
                error={validationErrors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color="#6B7280" />}
              />

              <Input
                label="パスワード"
                placeholder="6文字以上のパスワード"
                value={password}
                onChangeText={setPassword}
                isPassword
                error={validationErrors.password}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                className="self-end"
              >
                <Text className="text-primary-dark font-medium">
                  パスワードをお忘れですか？
                </Text>
              </TouchableOpacity>
            </View>

            {/* ログインボタン */}
            <Button
              isFullWidth
              onPress={handleLogin}
              isLoading={loading}
              className="mt-6"
            >
              ログイン
            </Button>

            {/* サインアップリンク */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">アカウントをお持ちでないですか？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-dark font-medium ml-1">
                  登録する
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
