import React from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import { OnboardingStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/logo-placeholder.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.colors.text.primary }]}>Stilya</Text>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          <Image
            source={require('@/assets/welcome-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          
          <Text style={[styles.mainTitle, { color: theme.colors.text.primary }]}>
            ファッションとの新しい出会い
          </Text>
          
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            あなたの好みを学習して、最適なファッションアイテムを提案します。スワイプするだけで、あなたの"好き"が見つかります。
          </Text>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Button
            isFullWidth
            onPress={() => navigation.navigate('AppIntro')}
          >
            始める
          </Button>
          
          <Text style={[styles.terms, { color: theme.colors.text.secondary }]}>
            続行すると、利用規約とプライバシーポリシーに同意したことになります。
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.05,
    marginBottom: height * 0.05,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: width * 0.8,
    height: height * 0.3,
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 32,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});

export default WelcomeScreen;
