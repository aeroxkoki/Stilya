import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useStyle } from '@/contexts/ThemeContext';
import IntroSlide from '@/components/onboarding/IntroSlide';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

// ナビゲーションの型
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

// 画像のプレースホルダーをインポート (テスト用)
import placeholderImages from '../../assets/images/onboarding/placeholder';

// 環境に応じて適切な画像を使用する関数
const getImage = (name: string) => {
  // 本番環境では実際の画像を使用
  try {
    // 画像ファイルが存在する場合はrequireを使用
    return require(`../../assets/welcome-illustration.png`);
  } catch (e) {
    // 画像ファイルが存在しない場合はプレースホルダーを使用
    console.log('Using placeholder image for:', name);
    return placeholderImages[name as keyof typeof placeholderImages] || placeholderImages.welcome;
  }
};

// オンボーディングの各ステップを定義
const STEPS = [
  {
    id: 'welcome',
    title: 'ようこそ',
    description: 'Stilyaはスワイプで好みを学習し、あなたに最適なファッションを提案します。',
    imagePath: getImage('welcome'),
  },
  {
    id: 'gender',
    title: 'あなたの性別は？',
    description: '性別に合ったファッションアイテムをご提案します。',
    imagePath: getImage('gender'),
  },
  {
    id: 'style',
    title: 'スタイルの好みは？',
    description: 'お好みのスタイルを選んで、レコメンドの精度を高めましょう。',
    imagePath: getImage('style'),
  },
  {
    id: 'age',
    title: '年代は？',
    description: '年代に合ったファッションアイテムをご提案します。',
    imagePath: getImage('age'),
  },
  {
    id: 'complete',
    title: '設定完了！',
    description: 'さっそくスワイプを始めましょう。',
    imagePath: getImage('complete'),
  },
];

// 画面の幅を取得
const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useStyle();
  const { user, setUser } = useAuth();
  
  // ユーザープロファイルの初期値
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [stylePreference, setStylePreference] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string | undefined>(undefined);
  
  const flatListRef = React.useRef<FlatList>(null);

  // 次のステップに進む
  const goToNextStep = () => {
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      // 最後のステップの場合は、Swipe画面へ遷移
      completeOnboarding();
    }
  };

  // 前のステップに戻る
  const goToPrevStep = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 性別の選択
  const handleGenderSelect = (selected: 'male' | 'female' | 'other') => {
    setGender(selected);
  };

  // スタイルの選択
  const handleStyleSelect = (style: string) => {
    if (stylePreference.includes(style)) {
      // すでに選択済みの場合は削除
      setStylePreference(stylePreference.filter(s => s !== style));
    } else {
      // 選択されていない場合は追加
      setStylePreference([...stylePreference, style]);
    }
  };

  // 年代の選択
  const handleAgeSelect = (age: string) => {
    setAgeGroup(age);
  };

  // オンボーディング完了時の処理
  const completeOnboarding = async () => {
    // ユーザー情報を更新
    if (user) {
      const updatedUser = {
        ...user,
        gender,
        stylePreference,
        ageGroup,
        onboardingCompleted: true,
      };
      
      // 本番ではここでユーザー情報を保存するAPIを呼び出す
      setUser(updatedUser);
    }
    
    // Swipe画面へ遷移
    navigation.navigate('Main', { screen: 'Swipe' } as any);
  };

  // スクロール時にインデックスを更新
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // 現在のステップに応じたコンテンツを表示
  const renderSlideContent = (step: typeof STEPS[number], index: number) => {
    switch (step.id) {
      case 'welcome':
        return (
          <IntroSlide
            title={step.title}
            description={step.description}
            image={step.imagePath}
          />
        );
      case 'gender':
        return (
          <View style={styles.selectionContainer} testID="gender-selection-screen">
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              性別を選択してください
            </Text>
            <View style={styles.optionsContainer}>
              <Button
                title="男性"
                onPress={() => handleGenderSelect('male')}
                variant={gender === 'male' ? 'primary' : 'outline'}
                style={styles.optionButton}
                testID="gender-male"
              />
              <Button
                title="女性"
                onPress={() => handleGenderSelect('female')}
                variant={gender === 'female' ? 'primary' : 'outline'}
                style={styles.optionButton}
                testID="gender-female"
              />
            </View>
          </View>
        );
      case 'style':
        const styleOptions = [
          'カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル'
        ];
        return (
          <View style={styles.selectionContainer} testID="style-preference-screen">
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              好みのスタイルを選択してください
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              複数選択可能です
            </Text>
            <View style={styles.optionsGrid}>
              {styleOptions.map(style => (
                <Button
                  key={style}
                  title={style}
                  onPress={() => handleStyleSelect(style)}
                  variant={stylePreference.includes(style) ? 'primary' : 'outline'}
                  style={styles.optionButton}
                  testID={`style-${style.toLowerCase()}`}
                />
              ))}
            </View>
          </View>
        );
      case 'age':
        const ageOptions = ['10代', '20代', '30代', '40代', '50代以上'];
        return (
          <View style={styles.selectionContainer} testID="age-group-screen">
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              年代を選択してください
            </Text>
            <View style={styles.optionsContainer}>
              {ageOptions.map(age => (
                <Button
                  key={age}
                  title={age}
                  onPress={() => handleAgeSelect(age)}
                  variant={ageGroup === age ? 'primary' : 'outline'}
                  style={styles.optionButton}
                  testID={`age-${age.replace('代', 's').replace('以上', 'plus')}`}
                />
              ))}
            </View>
          </View>
        );
      case 'complete':
        return (
          <IntroSlide
            title={step.title}
            description={step.description}
            image={step.imagePath}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="onboarding-screen"
    >
      <FlatList
        ref={flatListRef}
        data={STEPS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            {renderSlideContent(item, index)}
          </View>
        )}
        keyExtractor={item => item.id}
      />
      
      {/* インジケーターとナビゲーションボタン */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                { backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.buttonsContainer}>
          {currentIndex > 0 && (
            <Button
              title="戻る"
              onPress={goToPrevStep}
              variant="outline"
              style={styles.navigationButton}
            />
          )}
          
          <Button
            title={currentIndex === STEPS.length - 1 ? "始める" : "次へ"}
            onPress={goToNextStep}
            disabled={
              (currentIndex === 1 && !gender) || 
              (currentIndex === 2 && stylePreference.length === 0) || 
              (currentIndex === 3 && !ageGroup)
            }
            style={[
              styles.navigationButton, 
              currentIndex === 0 && styles.fullWidthButton
            ]}
            testID={currentIndex === STEPS.length - 1 ? "complete-button" : "next-button"}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    marginVertical: 8,
    minWidth: 150,
    marginHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default OnboardingScreen;