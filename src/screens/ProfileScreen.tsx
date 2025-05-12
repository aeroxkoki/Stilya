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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Feather name="user" size={50} color="#3B82F6" />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント設定</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="user" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>プロフィール編集</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="bell" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>通知設定</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ファッション設定</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="tag" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>スタイル設定</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="heart" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>お気に入り商品</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="repeat" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>スワイプ履歴</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>サポート</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="help-circle" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>ヘルプ・サポート</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="info" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>利用規約・プライバシーポリシー</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="mail" size={24} color="#757575" style={styles.menuIcon} />
          <Text style={styles.menuText}>お問い合わせ</Text>
          <Feather name="chevron-right" size={24} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>ログアウト</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>アプリバージョン: 0.1.0 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    color: '#333333',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 16,
    marginBottom: 10,
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  signOutButton: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default ProfileScreen;
