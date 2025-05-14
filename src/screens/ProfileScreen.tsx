import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/common';
import { defaultTheme } from '../styles/theme';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  // ログアウト確認
  const handleSignOut = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました。');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const MenuItem = ({ icon, title, onPress }: { icon: string; title: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Feather name={icon as any} size={24} color={defaultTheme.colors.status.success} style={styles.menuIcon} />
      <Text style={styles.menuText}>{title}</Text>
      <Feather name="chevron-right" size={24} color={defaultTheme.colors.text.hint} />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Feather name="user" size={50} color={defaultTheme.colors.primary} />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card style={styles.section}>
        <SectionTitle title="アカウント設定" />
        <MenuItem icon="user" title="プロフィール編集" />
        <MenuItem icon="bell" title="通知設定" />
      </Card>

      <Card style={styles.section}>
        <SectionTitle title="ファッション設定" />
        <MenuItem icon="tag" title="スタイル設定" />
        <MenuItem icon="heart" title="お気に入り商品" />
        <MenuItem icon="repeat" title="スワイプ履歴" />
      </Card>

      <Card style={styles.section}>
        <SectionTitle title="サポート" />
        <MenuItem icon="help-circle" title="ヘルプ・サポート" />
        <MenuItem icon="info" title="利用規約・プライバシーポリシー" />
        <MenuItem icon="mail" title="お問い合わせ" />
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="ログアウト"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
          textStyle={{ color: defaultTheme.colors.status.error }}
        />
      </View>

      <Text style={styles.versionText}>アプリバージョン: 0.1.0 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: defaultTheme.colors.background.main,
  },
  header: {
    backgroundColor: defaultTheme.colors.background.main,
    paddingVertical: defaultTheme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: defaultTheme.colors.border.light,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: defaultTheme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: defaultTheme.spacing.m,
  },
  email: {
    fontSize: defaultTheme.fontSizes.l,
    color: defaultTheme.colors.text.primary,
  },
  section: {
    marginTop: defaultTheme.spacing.m,
    padding: defaultTheme.spacing.m,
  },
  sectionTitle: {
    fontSize: defaultTheme.fontSizes.m,
    fontWeight: defaultTheme.fontWeights.medium,
    color: defaultTheme.colors.text.secondary,
    marginBottom: defaultTheme.spacing.s,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: defaultTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: defaultTheme.colors.border.light,
  },
  menuIcon: {
    marginRight: defaultTheme.spacing.m,
  },
  menuText: {
    flex: 1,
    fontSize: defaultTheme.fontSizes.m,
    color: defaultTheme.colors.text.primary,
  },
  buttonContainer: {
    marginVertical: defaultTheme.spacing.l,
    paddingHorizontal: defaultTheme.spacing.l,
  },
  signOutButton: {
    borderColor: defaultTheme.colors.status.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: defaultTheme.spacing.m,
    marginBottom: defaultTheme.spacing.xxl,
    fontSize: defaultTheme.fontSizes.s,
    color: defaultTheme.colors.text.secondary,
  },
});

export default ProfileScreen;
