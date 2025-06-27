import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useStyle } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { refreshRakutenProducts, checkRakutenImageUrls } from '@/utils/refreshRakutenProducts';

const AdminScreen: React.FC = () => {
  const { theme } = useStyle();
  
  const handleRefreshRakutenProducts = async () => {
    Alert.alert(
      '楽天商品の再取得',
      '楽天APIから商品データを再取得して、高画質画像に更新します。実行しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '実行',
          onPress: async () => {
            try {
              await refreshRakutenProducts();
              Alert.alert('完了', '楽天商品データを更新しました');
            } catch (error) {
              Alert.alert('エラー', '更新に失敗しました');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleCheckImageUrls = async () => {
    try {
      await checkRakutenImageUrls();
      Alert.alert('確認', 'コンソールログを確認してください');
    } catch (error) {
      Alert.alert('エラー', '確認に失敗しました');
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          管理画面
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          データ管理
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefreshRakutenProducts}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>楽天商品を再取得</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={handleCheckImageUrls}
        >
          <Ionicons name="information-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>画像URLを確認</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          注意事項
        </Text>
        <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
          • 楽天商品の再取得は、既存の低解像度画像を無効化して新しいデータを取得します
          {'\n'}
          • APIレート制限があるため、頻繁な実行は避けてください
          {'\n'}
          • 処理には数分かかる場合があります
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AdminScreen;
