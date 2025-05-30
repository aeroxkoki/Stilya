import React from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView >
      <View >
        {/* ヘッダー */}
        <View >
          <Image
            source={require('@/assets/logo-placeholder.png')}
            
            resizeMode="contain"
          />
          <Text >Stilya</Text>
        </View>

        {/* メインコンテンツ */}
        <View >
          <Image
            source={require('@/assets/welcome-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          
          <Text >
            ファッションとの新しい出会い
          </Text>
          
          <Text >
            あなたの好みを学習して、最適なファッションアイテムを提案します。スワイプするだけで、あなたの"好き"が見つかります。
          </Text>
        </View>

        {/* フッター */}
        <View >
          <Button
            isFullWidth
            onPress={() => navigation.navigate('AppIntro')}
          >
            始める
          </Button>
          
          <Text >
            続行すると、利用規約とプライバシーポリシーに同意したことになります。
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  illustration: {
    width: width * 0.8,
    height: height * 0.3,
  },
});

export default WelcomeScreen;
