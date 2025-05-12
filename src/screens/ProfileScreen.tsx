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
import theme from '../styles/theme';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

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
              await signOut();
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
      <Feather name={icon as any} size={24} color={theme.colors.gray600} style={styles.menuIcon} />
      <Text style={styles.menuText}>{title}</Text>
      <Feather name="chevron-right" size={24} color={theme.colors.gray400} />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Feather name="user" size={50} color={theme.colors.primary} />
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
          textStyle={{ color: theme.colors.error }}
        />
      </View>

      <Text style={styles.versionText}>アプリバージョン: 0.1.0 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  email: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
  },
  section: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  buttonContainer: {
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  signOutButton: {
    borderColor: theme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
  },
});

export default ProfileScreen;
