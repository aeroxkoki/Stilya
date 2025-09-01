import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Card } from '@/components/common';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyle } from '@/contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useStyle();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  // URLパラメータからトークンを取得
  const token = (route.params as any)?.token;

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'エラー',
        'パスワードリセットリンクが無効です。\nもう一度パスワードリセットをリクエストしてください。',
        [{ text: 'OK', onPress: () => navigation.navigate('Auth') }]
      );
    }
  }, [token, navigation]);

  const handleResetPassword = async () => {
    // バリデーション
    if (!password) {
      setError('新しいパスワードを入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Supabaseのパスワードリセット
      const { error: resetError } = await supabase.auth.updateUser({
        password: password
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        Alert.alert(
          '成功',
          'パスワードが正常に変更されました。\n新しいパスワードでログインしてください。',
          [
            {
              text: 'ログイン画面へ',
              onPress: () => navigation.navigate('Auth')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('パスワードのリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          パスワードをリセット
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          新しいパスワードを設定してください
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Input
          label="新しいパスワード"
          placeholder="6文字以上のパスワード"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          isPassword
          leftIcon={<Feather name="lock" size={20} color={theme.colors.text.secondary} />}
        />

        <Input
          label="パスワード（確認）"
          placeholder="同じパスワードを入力"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError(null);
          }}
          isPassword
          leftIcon={<Feather name="lock" size={20} color={theme.colors.text.secondary} />}
        />

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.status.error }]}>
            {error}
          </Text>
        )}

        <Button
          title="パスワードを変更"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.submitButton}
        />

        <Button
          title="ログイン画面に戻る"
          variant="text"
          onPress={() => navigation.navigate('Auth')}
          style={styles.backButton}
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
  backButton: {
    marginTop: 12,
  },
});

export default ResetPasswordScreen;
