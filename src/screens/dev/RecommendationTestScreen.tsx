import React, { useState, useEffect } from 'react';
import { Button, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRecommendations } from '@/hooks/useRecommendations';
import { runRecommendationPerformanceTest } from '@/utils/recommendationProfiler';
import { useAuth } from '@/hooks/useAuth';

/**
 * レコメンドエンジンのテストとチューニングのための画面
 * 開発者用ツールとして利用可能
 */
const RecommendationTestScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    recommendations,
    categoryRecommendations, 
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
    clearCache
  } = useRecommendations(20);
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // パフォーマンステストを実行
  const runPerformanceTest = async () => {
    if (!user) return;
    
    setTestResults(['パフォーマンステスト実行中...']);
    
    // コンソール出力をキャプチャ
    const originalConsoleLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog(...args);
    };
    
    try {
      await runRecommendationPerformanceTest(user.id);
      setTestResults(logs);
    } catch (err) {
      console.error('Test failed:', err);
      setTestResults([...logs, `テスト失敗: ${err}`]);
    } finally {
      // コンソール出力を元に戻す
      console.log = originalConsoleLog;
    }
  };

  // キャッシュクリアとリロード
  const handleClearCacheAndRefresh = () => {
    clearCache();
    refreshRecommendations(true);
    setTestResults(['キャッシュをクリアしました。データを再読み込みしています...']);
  };

  // エッジケーステスト
  const testEdgeCases = async () => {
    setTestResults(['エッジケーステスト実行中...']);
    
    if (!user) {
      setTestResults(['ユーザーがログインしていません。テストを実行できません。']);
      return;
    }
    
    const logs: string[] = [];
    
    try {
      // テスト1: キャッシュ使用
      const start1 = performance.now();
      await refreshRecommendations(false);
      const end1 = performance.now();
      logs.push(`テスト1: キャッシュ使用 - ${(end1 - start1).toFixed(2)}ms`);
      
      // テスト2: キャッシュスキップ
      const start2 = performance.now();
      await refreshRecommendations(true);
      const end2 = performance.now();
      logs.push(`テスト2: キャッシュなし - ${(end2 - start2).toFixed(2)}ms`);
      
      // テスト3: 複数回呼び出し（並行処理テスト）
      const start3 = performance.now();
      await Promise.all([
        refreshRecommendations(false),
        refreshRecommendations(false),
        refreshRecommendations(false)
      ]);
      const end3 = performance.now();
      logs.push(`テスト3: 並行処理テスト - ${(end3 - start3).toFixed(2)}ms`);
      
      setTestResults(logs);
    } catch (err) {
      console.error('Edge case test failed:', err);
      setTestResults([...logs, `テスト失敗: ${err}`]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>レコメンドエンジンテスト</Text>
        <Text style={styles.subtitle}>Day 26: テスト・チューニング</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本情報</Text>
        <Text>ユーザーID: {user?.id || '未ログイン'}</Text>
        <Text>読み込み状態: {isLoading ? '読込中...' : '完了'}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text>レコメンド商品数: {recommendations.length}</Text>
        <Text>カテゴリ別商品: {Object.keys(categoryRecommendations).length} カテゴリ</Text>
        
        {userPreference && (
          <View style={styles.preferenceSection}>
            <Text style={styles.subheader}>ユーザー好み分析</Text>
            <Text>上位タグ: {userPreference.topTags.join(', ')}</Text>
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
              <Text style={styles.link}>
                {showDetails ? '詳細を隠す' : '詳細を表示'}
              </Text>
            </TouchableOpacity>
            
            {showDetails && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.subheader}>タグスコア詳細:</Text>
                {Object.entries(userPreference.tagScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tag, score], index) => (
                    <Text key={index}>
                      {tag}: {score.toFixed(2)}
                    </Text>
                  ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テスト機能</Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="パフォーマンステスト実行" 
            onPress={runPerformanceTest}
            disabled={isLoading || !user}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="キャッシュクリア＆リロード" 
            onPress={handleClearCacheAndRefresh}
            disabled={isLoading || !user}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="エッジケーステスト" 
            onPress={testEdgeCases}
            disabled={isLoading || !user}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="手動更新（キャッシュ使用）" 
            onPress={() => refreshRecommendations(false)}
            disabled={isLoading || !user}
          />
        </View>
      </View>
      
      {testResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>テスト結果</Text>
          <ScrollView style={styles.resultsContainer}>
            {testResults.map((line, index) => (
              <Text key={index} style={styles.resultLine}>{line}</Text>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  preferenceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subheader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    color: 'blue',
    marginVertical: 8,
  },
  detailsContainer: {
    maxHeight: 200,
    marginVertical: 8,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  resultsContainer: {
    maxHeight: 300,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
  },
  resultLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 2,
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
});

export default RecommendationTestScreen;
