import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Button } from '@/components/common';

const RecommendScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold mb-4">おすすめ画面</Text>
        <Text className="text-gray-500 text-center mb-8">
          準備中です。次回の開発で実装予定です。
        </Text>
        <Button>おすすめを見る</Button>
      </View>
    </SafeAreaView>
  );
};

export default RecommendScreen;
