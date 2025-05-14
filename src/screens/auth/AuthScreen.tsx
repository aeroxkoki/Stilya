import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Input, Button, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

// ナビゲーションプロパティの型定義
type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface AuthScreenProps {
  navigation: AuthScreenNavigationProp;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // フィールドが入力された時にエラーをクリア
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleSubmit = async () => {
    if (isLogin) {
      await login(email, password);
    } else {
      await register(email, password);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      testID="auth-screen"
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {isLogin ? 'ログイン' : 'アカウント登録'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {isLogin 
            ? 'スタイル提案アプリ「Stilya」へようこそ' 
            : '新規アカウントを作成して、あなた好みのスタイルを見つけましょう'}
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Input
          label="メールアドレス"
          placeholder="メールアドレス"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail"
          testID="email-input"
        />

        <Input
          label="パスワード"
          placeholder="パスワード"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock"
          testID="password-input"
        />

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <Button
          title={isLogin ? 'ログイン' : '登録する'}
          onPress={handleSubmit}
          loading={loading}
          testID="login-button"
          style={styles.submitButton}
        />

        {isLogin && (
          <Button
            title="パスワードをお忘れですか？"
            type="text"
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
          />
        )}

        <Button
          title={isLogin ? 'アカウントを作成する' : 'すでにアカウントをお持ちの方'}
          type="text"
          onPress={toggleMode}
          style={styles.toggleModeButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  formCard: {
    padding: 24,
  },
  errorText: {
    marginVertical: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
  forgotPasswordButton: {
    marginTop: 12,
  },
  toggleModeButton: {
    marginTop: 12,
  },
});

export default AuthScreen;