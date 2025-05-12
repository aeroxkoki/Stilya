import React, { useState } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/types';
import { formatErrorMessage } from '@/utils';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
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

    // パスワード確認のバリデーション
    if (!confirmPassword) {
      errors.confirmPassword = 'パスワード（確認）を入力してください';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(email, password);
      // 登録成功は、App.tsxで処理されるため、ここでのナビゲーションは不要
    } catch (error) {
      console.error('Register error:', error);
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
              <Text className="text-2xl font-bold text-gray-800">アカウント登録</Text>
              <Text className="text-sm text-gray-500 mt-1">
                スタイルを見つける旅を始めましょう
              </Text>
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

              <Input
                label="パスワード（確認）"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={validationErrors.confirmPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#6B7280" />}
              />
            </View>

            {/* 登録ボタン */}
            <Button
              isFullWidth
              onPress={handleRegister}
              isLoading={loading}
              className="mt-6"
            >
              登録する
            </Button>

            {/* ログインリンク */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">すでにアカウントをお持ちですか？</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-primary-dark font-medium ml-1">
                  ログイン
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
