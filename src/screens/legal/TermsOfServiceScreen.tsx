import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStyle } from '@/contexts/ThemeContext';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          利用規約
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.colors.text.secondary }]}>
          最終更新日: 2025年1月1日
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第1条（利用規約の適用）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          本利用規約（以下「本規約」）は、Stilya（以下「当社」）が提供するファッション提案アプリケーション
          「Stilya」（以下「本サービス」）の利用条件を定めるものです。
          ユーザーの皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第2条（利用登録）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          1. 利用登録の申請者は、当社の定める方法によって利用登録を申請し、
          当社がこれを承認することによって利用登録が完了するものとします。
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          2. 当社は、以下の場合には利用登録の申請を承認しないことがあります：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 虚偽の情報を申告した場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 本規約に違反したことがある者からの申請である場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • その他、当社が利用登録を相当でないと判断した場合
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第3条（アカウントの管理）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          1. ユーザーは、自己の責任において、本サービスのアカウントを適切に管理するものとします。
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          2. ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第4条（利用料金）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          本サービスの基本機能は無料でご利用いただけます。
          ただし、一部のプレミアム機能については、別途定める利用料金をお支払いいただく場合があります。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第5条（禁止事項）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 法令または公序良俗に違反する行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 犯罪行為に関連する行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 当社、他のユーザー、その他第三者の知的財産権、肖像権、プライバシー等を侵害する行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 本サービスによって得られた情報を商業的に利用する行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 当社のサービスの運営を妨害するおそれのある行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 不正アクセスをし、またはこれを試みる行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 他のユーザーに関する個人情報等を収集または蓄積する行為
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • その他、当社が不適切と判断する行為
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第6条（本サービスの提供の停止等）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は、以下のいずれかの事由があると判断した場合、
          ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 保守点検または更新を行う場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • 地震、落雷、火災、停電または天災などの不可抗力により、サービスの提供が困難となった場合
        </Text>
        <Text style={[styles.listItem, { color: theme.colors.text.secondary }]}>
          • コンピューターまたは通信回線等が事故により停止した場合
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第7条（著作権）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          本サービスにおいて当社が提供する一切の著作物の著作権は、当社または当社にライセンスを許諾している者に帰属します。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第8条（免責事項）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          1. 当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          2. 当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、
          連絡または紛争等について一切責任を負いません。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第9条（利用規約の変更）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
          変更後の本規約は、当社ウェブサイトに掲示された時点から効力を生じるものとします。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第10条（通知または連絡）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          第11条（準拠法・裁判管轄）
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          1. 本規約の解釈にあたっては、日本法を準拠法とします。
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          2. 本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          お問い合わせ
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text.secondary }]}>
          本規約に関するご質問は、以下までお問い合わせください：
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

export default TermsOfServiceScreen;
