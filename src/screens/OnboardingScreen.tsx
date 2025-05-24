import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

// 画面の幅を取得
const { width } = Dimensions.get('window');

// オンボーディングの手順
const STEPS = [
  {
    id: 'gender',
    title: 'あなたの性別は？',
    options: [
      { id: 'male', label: 'メンズ', icon: 'user' },
      { id: 'female', label: 'レディース', icon: 'user' },
      { id: 'other', label: 'その他', icon: 'users' },
    ],
  },
  {
    id: 'style',
    title: 'どんなスタイルが好き？',
    options: [
      { id: 'casual', label: 'カジュアル', icon: 'smile' },
      { id: 'formal', label: 'フォーマル', icon: 'briefcase' },
      { id: 'street', label: 'ストリート', icon: 'music' },
      { id: 'minimal', label: 'ミニマル', icon: 'square' },
      { id: 'vintage', label: 'ビンテージ', icon: 'clock' },
    ],
  },
  {
    id: 'age',
    title: '年代を選択',
    options: [
      { id: 'teens', label: '10代', icon: 'circle' },
      { id: 'twenties', label: '20代', icon: 'circle' },
      { id: 'thirties', label: '30代', icon: 'circle' },
      { id: 'forties', label: '40代', icon: 'circle' },
      { id: 'fifties', label: '50代以上', icon: 'circle' },
    ],
  },
];

const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({
    gender: '',
    style: [],
    age: '',
  });
  const { user } = useAuth();

  // 現在の手順を取得
  const step = STEPS[currentStep];

  // 選択を更新する
  const handleSelect = (optionId: string) => {
    const stepId = step.id;

    if (stepId === 'style') {
      // スタイルの場合は複数選択可能
      setSelections(prev => {
        const currentSelections = prev[stepId] as string[] || [];
        if (currentSelections.includes(optionId)) {
          // 選択済みなら削除
          return {
            ...prev,
            [stepId]: currentSelections.filter(id => id !== optionId),
          };
        } else {
          // 未選択なら追加（最大3つまで）
          if (currentSelections.length < 3) {
            return {
              ...prev,
              [stepId]: [...currentSelections, optionId],
            };
          }
          return prev;
        }
      });
    } else {
      // 性別と年代の場合は単一選択
      setSelections(prev => ({
        ...prev,
        [stepId]: optionId,
      }));
    }
  };

  // 次のステップに進む
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // 最後のステップの場合は完了処理
      completeOnboarding();
    }
  };

  // 前のステップに戻る
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // オンボーディング完了処理
  const completeOnboarding = async () => {
    try {
      // TODO: Supabaseにユーザー設定を保存する
      console.log('Onboarding completed with selections:', selections);
      
      // ここで実際にはSupabaseにデータを保存するコードを追加
      // 例: await supabase.from('profiles').upsert({ user_id: user?.id, ...preferences });
    } catch (error) {
      console.error('Error saving onboarding preferences:', error);
    }
  };

  // 現在のステップが有効か（選択が必要な場合に選択されているか）
  const isCurrentStepValid = () => {
    const stepId = step.id;
    if (stepId === 'style') {
      return (selections[stepId] as string[] || []).length > 0;
    }
    return !!selections[stepId];
  };

  // オプションが選択されているかチェック
  const isOptionSelected = (optionId: string) => {
    const stepId = step.id;
    if (stepId === 'style') {
      return (selections[stepId] as string[] || []).includes(optionId);
    }
    return selections[stepId] === optionId;
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール設定</Text>
        <Text style={styles.subtitle}>
          あなたの好みに合った商品をおすすめするために、いくつか質問に答えてください。
        </Text>
      </View>

      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep ? styles.progressDotActive : {},
            ]}
          />
        ))}
      </View>

      {/* 質問 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{step.title}</Text>

        <FlatList
          data={step.options}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionButton,
                isOptionSelected(item.id) ? styles.optionButtonSelected : {},
              ]}
              onPress={() => handleSelect(item.id)}
            >
              <Feather
                name={item.icon as any}
                size={24}
                color={isOptionSelected(item.id) ? 'white' : '#757575'}
                style={styles.optionIcon}
              />
              <Text
                style={[
                  styles.optionLabel,
                  isOptionSelected(item.id) ? styles.optionLabelSelected : {},
                ]}
              >
                {item.label}
              </Text>
              {isOptionSelected(item.id) && (
                <Feather name="check" size={20} color="white" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          )}
          numColumns={2}
          contentContainerStyle={styles.optionsGrid}
        />

        {step.id === 'style' && (
          <Text style={styles.helperText}>
            最大3つまで選択できます（{(selections.style as string[] || []).length}/3）
          </Text>
        )}
      </View>

      {/* ナビゲーションボタン */}
      <View style={styles.navContainer}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={20} color="#3B82F6" />
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !isCurrentStepValid() ? styles.nextButtonDisabled : {},
          ]}
          onPress={handleNext}
          disabled={!isCurrentStepValid()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep < STEPS.length - 1 ? '次へ' : '完了'}
          </Text>
          <Feather
            name={currentStep < STEPS.length - 1 ? 'arrow-right' : 'check'}
            size={20}
            color="white"
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </View>

      {/* スキップボタン */}
      <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipButtonText}>スキップ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    width: 20,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333333',
  },
  optionsGrid: {
    paddingBottom: 20,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    marginBottom: 10,
    minHeight: 60,
  },
  optionButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  optionLabelSelected: {
    color: 'white',
  },
  checkIcon: {
    marginLeft: 5,
  },
  helperText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 5,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  nextButtonIcon: {
    marginLeft: 5,
  },
  skipButton: {
    alignSelf: 'center',
    padding: 15,
    marginBottom: 30,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
});

export default OnboardingScreen;
