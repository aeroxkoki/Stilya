import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyle } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase';
import { batchDiagnoseImageUrls, diagnoseImageUrl, autoFixImageUrl } from '@/utils/imageValidation';
import CachedImage from '@/components/common/CachedImage';

const { width: screenWidth } = Dimensions.get('window');

interface ImageDiagnosisData {
  id: string;
  title: string;
  imageUrl: string;
  diagnosis: ReturnType<typeof diagnoseImageUrl>;
  fixed?: {
    url: string;
    changes: string[];
  };
}

const ImageDiagnosisScreen: React.FC = () => {
  const { theme } = useStyle();
  const [loading, setLoading] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState<ImageDiagnosisData[]>([]);
  const [summary, setSummary] = useState<ReturnType<typeof batchDiagnoseImageUrls> | null>(null);
  const [fixing, setFixing] = useState(false);

  // データベースから商品画像URLを取得して診断
  const runDiagnosis = async () => {
    setLoading(true);
    try {
      // 最新の商品50件を取得
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[ImageDiagnosis] Error fetching products:', error);
        Alert.alert('エラー', 'データの取得に失敗しました');
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert('情報', '診断する商品がありません');
        return;
      }

      // 画像URLを抽出
      const imageUrls = data.map(product => product.image_url || '');
      
      // バッチ診断を実行
      const batchResult = batchDiagnoseImageUrls(imageUrls);
      setSummary(batchResult);

      // 個別の診断結果を準備
      const diagnosisResults: ImageDiagnosisData[] = data.map((product, index) => ({
        id: product.id,
        title: product.title,
        imageUrl: product.image_url || '',
        diagnosis: batchResult.details[index].diagnosis,
      }));

      setDiagnosisData(diagnosisResults);

      // 問題がある場合はアラート
      if (batchResult.invalidCount > 0) {
        Alert.alert(
          '診断結果',
          `${batchResult.invalidCount}件の画像URLに問題が見つかりました。\n\n` +
          `HTTPの問題: ${batchResult.httpCount}件\n` +
          `サムネイルURL: ${batchResult.thumbnailCount}件\n` +
          `低解像度: ${batchResult.lowResCount}件`,
          [
            { text: 'キャンセル', style: 'cancel' },
            { text: '自動修正', onPress: fixAllImages }
          ]
        );
      } else {
        Alert.alert('診断結果', 'すべての画像URLは正常です！');
      }

    } catch (error) {
      console.error('[ImageDiagnosis] Error:', error);
      Alert.alert('エラー', '診断中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // すべての問題のある画像URLを修正
  const fixAllImages = async () => {
    setFixing(true);
    try {
      const problemImages = diagnosisData.filter(item => !item.diagnosis.isValid);
      
      for (const item of problemImages) {
        const { fixed, changes } = autoFixImageUrl(item.imageUrl);
        
        // データベースを更新
        const { error } = await supabase
          .from('external_products')
          .update({ image_url: fixed })
          .eq('id', item.id);

        if (error) {
          console.error(`[ImageDiagnosis] Failed to fix ${item.id}:`, error);
        } else {
          console.log(`[ImageDiagnosis] Fixed ${item.id}:`, changes);
        }
      }

      Alert.alert(
        '修正完了',
        `${problemImages.length}件の画像URLを修正しました。`,
        [{ text: 'OK', onPress: runDiagnosis }]
      );

    } catch (error) {
      console.error('[ImageDiagnosis] Fix error:', error);
      Alert.alert('エラー', '修正中にエラーが発生しました');
    } finally {
      setFixing(false);
    }
  };

  // 個別の画像診断結果を表示
  const renderDiagnosisItem = ({ item }: { item: ImageDiagnosisData }) => {
    const isValid = item.diagnosis.isValid;
    
    return (
      <View style={[
        styles.itemContainer,
        { 
          backgroundColor: theme.colors.card.background,
          borderColor: isValid ? theme.colors.status.success : theme.colors.status.error
        }
      ]}>
        <View style={styles.imageSection}>
          <Text style={[styles.itemTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* 現在の画像 */}
          <View style={styles.imageContainer}>
            <Text style={[styles.imageLabel, { color: theme.colors.text.secondary }]}>
              現在の画像:
            </Text>
            {item.imageUrl ? (
              <CachedImage
                source={{ uri: item.imageUrl }}
                style={styles.image}
                showLoadingIndicator
              />
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Text style={{ color: theme.colors.text.hint }}>画像なし</Text>
              </View>
            )}
          </View>

          {/* 修正後の画像（問題がある場合） */}
          {!isValid && item.imageUrl && (
            <View style={styles.imageContainer}>
              <Text style={[styles.imageLabel, { color: theme.colors.text.secondary }]}>
                修正後の画像:
              </Text>
              <CachedImage
                source={{ uri: autoFixImageUrl(item.imageUrl).fixed }}
                style={styles.image}
                showLoadingIndicator
              />
            </View>
          )}
        </View>

        <View style={styles.diagnosisSection}>
          <Text style={[
            styles.statusText,
            { color: isValid ? theme.colors.status.success : theme.colors.status.error }
          ]}>
            {isValid ? '✓ 正常' : '✗ 問題あり'}
          </Text>

          {!isValid && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                問題:
              </Text>
              {item.diagnosis.issues.map((issue, index) => (
                <Text key={index} style={[styles.issueText, { color: theme.colors.status.error }]}>
                  • {issue}
                </Text>
              ))}

              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary, marginTop: 8 }]}>
                提案:
              </Text>
              {item.diagnosis.suggestions.map((suggestion, index) => (
                <Text key={index} style={[styles.suggestionText, { color: theme.colors.status.warning }]}>
                  • {suggestion}
                </Text>
              ))}
            </>
          )}

          <Text style={[styles.urlText, { color: theme.colors.text.hint }]} numberOfLines={2}>
            URL: {item.imageUrl}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          画像URL診断
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          商品画像のURLを診断して問題を検出します
        </Text>
      </View>

      {/* サマリー */}
      {summary && (
        <View style={[styles.summaryContainer, { backgroundColor: theme.colors.card.background }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text.primary }]}>
            診断サマリー
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.status.success }]}>
                {summary.validCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
                正常
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.status.error }]}>
                {summary.invalidCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
                問題あり
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.status.warning }]}>
                {summary.httpCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
                HTTP
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: theme.colors.status.warning }]}>
                {summary.thumbnailCount}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
                サムネイル
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* アクションボタン */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary }
          ]}
          onPress={runDiagnosis}
          disabled={loading || fixing}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>診断を実行</Text>
          )}
        </TouchableOpacity>

        {summary && summary.invalidCount > 0 && (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.status.warning, marginLeft: 12 }
            ]}
            onPress={fixAllImages}
            disabled={loading || fixing}
          >
            {fixing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>すべて修正</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* 診断結果リスト */}
      <FlatList
        data={diagnosisData}
        renderItem={renderDiagnosisItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  summaryContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSection: {
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagnosisSection: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 12,
    marginBottom: 2,
  },
  suggestionText: {
    fontSize: 12,
    marginBottom: 2,
  },
  urlText: {
    fontSize: 10,
    marginTop: 8,
  },
});

export default ImageDiagnosisScreen;
