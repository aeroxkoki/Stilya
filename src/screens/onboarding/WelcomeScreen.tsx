import React from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/common';
import { OnboardingStackParamList } from '@/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between py-10 px-6">
        {/* ヘッダー */}
        <View className="w-full items-center mb-4">
          <Image
            source={require('@/assets/logo-placeholder.png')}
            className="w-20 h-20"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-gray-800 mt-2">Stilya</Text>
        </View>

        {/* メインコンテンツ */}
        <View className="items-center px-4">
          <Image
            source={require('@/assets/welcome-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          
          <Text className="text-2xl font-bold text-center mt-8 mb-2">
            ファッションとの新しい出会い
          </Text>
          
          <Text className="text-gray-600 text-center mb-8 leading-6">
            あなたの好みを学習して、最適なファッションアイテムを提案します。スワイプするだけで、あなたの"好き"が見つかります。
          </Text>
        </View>

        {/* フッター */}
        <View className="w-full">
          <Button
            isFullWidth
            onPress={() => navigation.navigate('Gender')}
          >
            始める
          </Button>
          
          <Text className="text-gray-400 text-xs text-center mt-6">
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
