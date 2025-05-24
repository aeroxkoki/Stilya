import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// 実際のチャートコンポーネントのインポートは後で追加
// import ActivitySummary from '../../components/report/ActivitySummary';
// import ConversionChart from '../../components/report/ConversionChart';
// import TrendAnalysis from '../../components/report/TrendAnalysis';

import { getAnalyticsData } from '../../services/analyticsService';
// 必要に応じてAnalyticsDataをインポート
// import { AnalyticsData } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// 一時的なAnalyticsDataの型定義
interface AnalyticsData {
  totalSwipes?: number;
  totalFavorites?: number;
  totalViews?: number;
  ctr?: string;
  cvr?: string;
  preferredStyles?: string[];
  activity?: any[];
  conversion?: any[];
  styleTrends?: any[];
}

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
    <View style={[styles.placeholder, { height }]}>
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>データをロード中...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="再読み込み" 
          onPress={() => navigation.navigate('Report' as never)} 
          variant="primary"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.headerText}>アプリ使用状況</Text>
        
        <Card style={styles.card} padding={16}>
          <Text style={styles.sectionTitle}>あなたのアクティビティ概要</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <ActivitySummary data={analyticsData?.activity || []} />
          */}
          {renderPlaceholder('アクティビティ概要チャート', 180)}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>スワイプ数</Text>
              <Text style={styles.statValue}>{analyticsData?.totalSwipes || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>お気に入り</Text>
              <Text style={styles.statValue}>{analyticsData?.totalFavorites || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>商品閲覧</Text>
              <Text style={styles.statValue}>{analyticsData?.totalViews || 0}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card} padding={16}>
          <Text style={styles.sectionTitle}>コンバージョン分析</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <ConversionChart data={analyticsData?.conversion || []} />
          */}
          {renderPlaceholder('コンバージョンチャート', 200)}
          
          <View style={styles.conversionSection}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>クリック率 (CTR)</Text>
              <Text style={styles.conversionValue}>{analyticsData?.ctr || '0'}%</Text>
            </View>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>購入率 (CVR)</Text>
              <Text style={styles.conversionValue}>{analyticsData?.cvr || '0'}%</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card} padding={16}>
          <Text style={styles.sectionTitle}>スタイル傾向分析</Text>
          {/* 実際のチャートライブラリが導入されたらコメントアウトを解除
          <TrendAnalysis data={analyticsData?.styleTrends || []} />
          */}
          {renderPlaceholder('スタイル傾向チャート', 220)}
          
          <View style={styles.styleSection}>
            <Text style={styles.styleLabel}>あなたの好みのスタイル:</Text>
            <View style={styles.styleTagsContainer}>
              {(analyticsData?.preferredStyles || []).map((style, index) => (
                <View key={index} style={styles.styleTag}>
                  <Text style={styles.styleTagText}>{style}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversionSection: {
    marginTop: 16,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conversionLabel: {
    color: '#6B7280',
  },
  conversionValue: {
    fontWeight: '600',
  },
  styleSection: {
    marginTop: 16,
  },
  styleLabel: {
    color: '#6B7280',
    marginBottom: 8,
  },
  styleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  styleTag: {
    backgroundColor: '#DBEAFE',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  styleTagText: {
    color: '#1E40AF',
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  placeholderText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
  },
});
