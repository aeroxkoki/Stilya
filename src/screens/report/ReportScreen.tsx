import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// 実際のチャートコンポーネントのインポートは後で追加
// import ActivitySummary from '../../components/report/ActivitySummary';
// import ConversionChart from '../../components/report/ConversionChart';
// import TrendAnalysis from '../../components/report/TrendAnalysis';

import { getAnalyticsData } from '../../services/analyticsService';
import { AnalyticsData } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const ReportScreen: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAnalyticsData();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('データの読み込み中にエラーが発生しました。後でもう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // この時点では実際のチャートライブラリがないので、プレースホルダーを表示する
  const renderPlaceholder = (title: string, height: number = 200) => (
    <View className="bg-gray-100 rounded-lg p-4 w-full" style={{ height }}>
      <Text className="text-gray-500 text-center">{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">データをロード中...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white p-4 items-center justify-center">
        <Text className="text-red-500 mb-4">{error}</Text>
        <Button 
          title="再読み込み" 
          onPress={() => navigation.navigate('Report' as never)} 
          variant="primary"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6">アプリ使用状況</Text>
        
        <Card className="mb-6 p-4">
          <Text className="text-lg font-semibold mb-4">あなたのアクティビティ概要</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <ActivitySummary data={analyticsData?.activity || []} />
          */}
          {renderPlaceholder('アクティビティ概要チャート', 180)}
          
          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-gray-500 text-xs">スワイプ数</Text>
              <Text className="text-xl font-bold">{analyticsData?.totalSwipes || 0}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-xs">お気に入り</Text>
              <Text className="text-xl font-bold">{analyticsData?.totalFavorites || 0}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-xs">商品閲覧</Text>
              <Text className="text-xl font-bold">{analyticsData?.totalViews || 0}</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-6 p-4">
          <Text className="text-lg font-semibold mb-4">コンバージョン分析</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <ConversionChart data={analyticsData?.conversion || []} />
          */}
          {renderPlaceholder('コンバージョンチャート', 200)}
          
          <View className="mt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">クリック率 (CTR)</Text>
              <Text className="font-semibold">{analyticsData?.ctr || '0'}%</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">購入率 (CVR)</Text>
              <Text className="font-semibold">{analyticsData?.cvr || '0'}%</Text>
            </View>
          </View>
        </Card>

        <Card className="mb-6 p-4">
          <Text className="text-lg font-semibold mb-4">スタイル傾向分析</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <TrendAnalysis data={analyticsData?.styleTrends || []} />
          */}
          {renderPlaceholder('スタイル傾向チャート', 220)}
          
          <View className="mt-4">
            <Text className="text-gray-600 mb-2">あなたの好みのスタイル:</Text>
            <View className="flex-row flex-wrap">
              {(analyticsData?.preferredStyles || []).map((style, index) => (
                <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-blue-800">{style}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportScreen;
