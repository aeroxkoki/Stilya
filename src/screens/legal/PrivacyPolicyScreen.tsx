import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStyle } from '@/contexts/ThemeContext';

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          プライバシーポリシー
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.colors.text.secondary }]}>
          最終更新日: 2025年1月1日
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          1. はじめに
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          Stilya（以下「当社」）は、お客様のプライバシーを尊重し、個人情報の保護に努めています。
          本プライバシーポリシーは、当社のサービスにおける個人情報の取り扱いについて説明します。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          2. 収集する情報
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は以下の情報を収集する場合があります：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • メールアドレス
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 性別、年齢層（任意）
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • スタイル選好
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • スワイプ履歴、お気に入り商品
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • アプリの使用状況データ
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          3. 情報の使用目的
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          収集した情報は以下の目的で使用されます：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • パーソナライズされた商品推薦の提供
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • サービスの改善と最適化
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • カスタマーサポートの提供
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 利用統計の分析
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          4. 情報の共有
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は、お客様の個人情報を第三者に販売、貸与、または共有することはありません。
          ただし、以下の場合を除きます：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • お客様の同意がある場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 法的要請に応じる必要がある場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • サービス提供に必要な業務委託先（機密保持契約を締結）
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          5. データセキュリティ
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は、お客様の個人情報を保護するため、適切な技術的・組織的セキュリティ対策を講じています。
          データは暗号化され、安全なサーバーに保管されます。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          6. お客様の権利
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          お客様は以下の権利を有します：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 個人情報へのアクセス権
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 個人情報の訂正・更新権
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 個人情報の削除要求権
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • データポータビリティの権利
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          7. Cookie（クッキー）の使用
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社のアプリは、ユーザー体験を向上させるためにCookieおよび類似の技術を使用する場合があります。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          8. 子供のプライバシー
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社のサービスは13歳未満の子供を対象としていません。
          13歳未満の子供から意図的に個人情報を収集することはありません。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          9. ポリシーの変更
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は、本プライバシーポリシーを随時更新する場合があります。
          重要な変更がある場合は、アプリ内通知またはメールでお知らせします。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          10. お問い合わせ
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          プライバシーに関するご質問やご懸念がある場合は、以下までご連絡ください：
        </Text>
        <Text style={[styles.contactInfo, { color: theme.colors.primary }]}>
          support@stilya.jp
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 40,
  },
});

export default PrivacyPolicyScreen;
