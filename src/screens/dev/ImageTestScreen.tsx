import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyle } from '@/contexts/ThemeContext';
import CachedImage from '@/components/common/CachedImage';
import { diagnoseImageUrl, autoFixImageUrl } from '@/utils/imageValidation';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

const ImageTestScreen: React.FC = () => {
  const { theme } = useStyle();
  const [testUrl, setTestUrl] = useState('');
  const [diagnosis, setDiagnosis] = useState<ReturnType<typeof diagnoseImageUrl> | null>(null);
  const [fixedUrl, setFixedUrl] = useState('');
  const [testMode, setTestMode] = useState<'cached' | 'direct'>('cached');

  // テスト用のサンプルURL
  const sampleUrls = [
    {
      label: '楽天画像（通常）',
      url: 'https://image.rakuten.co.jp/@0_mall/stylife/cabinet/item/141/nh9141-01_1.jpg'
    },
    {
      label: '楽天画像（サムネイル）',
      url: 'https://thumbnail.image.rakuten.co.jp/@0_mall/stylife/cabinet/item/141/nh9141-01_1.jpg?_ex=128x128'
    },
    {
      label: 'HTTPのURL（エラー想定）',
      url: 'http://image.rakuten.co.jp/@0_mall/stylife/cabinet/item/141/nh9141-01_1.jpg'
    },
    {
      label: '無効なURL',
      url: 'not-a-valid-url'
    }
  ];

  const runTest = () => {
    if (!testUrl) {
      Alert.alert('エラー', 'URLを入力してください');
      return;
    }

    // 診断を実行
    const result = diagnoseImageUrl(testUrl);
    setDiagnosis(result);

    // 自動修正を実行
    const { fixed } = autoFixImageUrl(testUrl);
    setFixedUrl(fixed);
  };

  const selectSampleUrl = (url: string) => {
    setTestUrl(url);
    setDiagnosis(null);
    setFixedUrl('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              画像読み込みテスト
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              URLを入力して画像の読み込みをテストします
            </Text>
          </View>

          {/* サンプルURL */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              サンプルURL
            </Text>
            {sampleUrls.map((sample, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.sampleButton, { backgroundColor: theme.colors.card.background }]}
                onPress={() => selectSampleUrl(sample.url)}
              >
                <Text style={[styles.sampleLabel, { color: theme.colors.text.secondary }]}>
                  {sample.label}
                </Text>
                <Text style={[styles.sampleUrl, { color: theme.colors.text.hint }]} numberOfLines={1}>
                  {sample.url}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* URL入力 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              テストURL
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.input.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border
                }
              ]}
              value={testUrl}
              onChangeText={setTestUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={theme.colors.text.hint}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
            />
          </View>

          {/* テストモード選択 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              テストモード
            </Text>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  testMode === 'cached' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setTestMode('cached')}
              >
                <Text style={[
                  styles.modeText,
                  { color: testMode === 'cached' ? 'white' : theme.colors.text.primary }
                ]}>
                  CachedImage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  testMode === 'direct' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setTestMode('direct')}
              >
                <Text style={[
                  styles.modeText,
                  { color: testMode === 'direct' ? 'white' : theme.colors.text.primary }
                ]}>
                  Direct Image
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* テストボタン */}
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
            onPress={runTest}
          >
            <Text style={styles.testButtonText}>テスト実行</Text>
          </TouchableOpacity>

          {/* 診断結果 */}
          {diagnosis && (
            <View style={[styles.resultSection, { backgroundColor: theme.colors.card.background }]}>
              <Text style={[styles.resultTitle, { color: theme.colors.text.primary }]}>
                診断結果
              </Text>
              
              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: theme.colors.text.secondary }]}>
                  ステータス:
                </Text>
                <Text style={[
                  styles.resultValue,
                  { color: diagnosis.isValid ? theme.colors.status.success : theme.colors.status.error }
                ]}>
                  {diagnosis.isValid ? '✓ 有効' : '✗ 無効'}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={[styles.resultLabel, { color: theme.colors.text.secondary }]}>
                  HTTPS:
                </Text>
                <Text style={[
                  styles.resultValue,
                  { color: diagnosis.isSecure ? theme.colors.status.success : theme.colors.status.error }
                ]}>
                  {diagnosis.isSecure ? '✓ 安全' : '✗ 非安全'}
                </Text>
              </View>

              {diagnosis.issues.length > 0 && (
                <>
                  <Text style={[styles.resultSubtitle, { color: theme.colors.text.primary }]}>
                    問題:
                  </Text>
                  {diagnosis.issues.map((issue, index) => (
                    <Text key={index} style={[styles.issueText, { color: theme.colors.status.error }]}>
                      • {issue}
                    </Text>
                  ))}
                </>
              )}

              {fixedUrl && fixedUrl !== testUrl && (
                <>
                  <Text style={[styles.resultSubtitle, { color: theme.colors.text.primary }]}>
                    修正後のURL:
                  </Text>
                  <Text style={[styles.fixedUrl, { color: theme.colors.primary }]}>
                    {fixedUrl}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* 画像プレビュー */}
          {testUrl && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                画像プレビュー
              </Text>
              
              <View style={styles.previewContainer}>
                <Text style={[styles.previewLabel, { color: theme.colors.text.secondary }]}>
                  元のURL:
                </Text>
                {testMode === 'cached' ? (
                  <CachedImage
                    source={{ uri: testUrl }}
                    style={styles.previewImage}
                    showLoadingIndicator
                  />
                ) : (
                  <Image
                    source={{ uri: testUrl }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                )}
              </View>

              {fixedUrl && fixedUrl !== testUrl && (
                <View style={[styles.previewContainer, { marginTop: 20 }]}>
                  <Text style={[styles.previewLabel, { color: theme.colors.text.secondary }]}>
                    修正後のURL:
                  </Text>
                  {testMode === 'cached' ? (
                    <CachedImage
                      source={{ uri: fixedUrl }}
                      style={styles.previewImage}
                      showLoadingIndicator
                    />
                  ) : (
                    <Image
                      source={{ uri: fixedUrl }}
                      style={styles.previewImage}
                      contentFit="cover"
                    />
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sampleButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleUrl: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultSection: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  issueText: {
    fontSize: 12,
    marginBottom: 2,
  },
  fixedUrl: {
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});

export default ImageTestScreen;
