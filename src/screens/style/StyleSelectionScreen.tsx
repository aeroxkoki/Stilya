import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Dimensions,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { StyleType, styleThemes } from '@/styles/theme';
import { Button } from '@/components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

// ナビゲーションの型定義（実際のアプリのルート構造に合わせて調整）
type RootStackParamList = {
  StyleSelection: undefined;
  Main: undefined;
  // 他のルート
};

type Props = NativeStackScreenProps<RootStackParamList, 'StyleSelection'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = width * 0.85 * 1.5;

// スタイルのサンプル商品データ
const sampleProducts = {
  minimal: {
    title: 'オーバーサイズコットンTシャツ',
    brand: 'MINIMALIST TOKYO',
    price: 6800,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'
  },
  natural: {
    title: 'オーガニックリネンブラウス',
    brand: 'Natural Beauty',
    price: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800'
  },
  bold: {
    title: 'カラーブロックスウェット',
    brand: 'VIVID STYLE',
    price: 8200,
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800'
  }
};

// スタイル選択データ
const styleOptions: {id: StyleType; name: string; description: string}[] = [
  {
    id: 'minimal',
    name: 'ミニマル',
    description: 'シャープでモダンなデザインと洗練されたシンプルさを重視したスタイル'
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '柔らかく有機的なデザイン、アースカラーを基調とした優しい印象のスタイル'
  },
  {
    id: 'bold',
    name: 'ボールド',
    description: '鮮やかな色彩と大胆なコントラスト、エネルギッシュで個性的なスタイル'
  }
];

const StyleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useStyle();
  const { styleType, setStyleType } = useStyle();
  const [selectedStyle, setSelectedStyle] = useState<StyleType>(styleType);
  
  // アニメーション値
  const [animatedScales] = useState({
    minimal: new Animated.Value(styleType === 'minimal' ? 1 : 0.95),
    natural: new Animated.Value(styleType === 'natural' ? 1 : 0.95),
    bold: new Animated.Value(styleType === 'bold' ? 1 : 0.95)
  });

  // スタイル選択時のアニメーション
  const handleSelectStyle = (style: StyleType) => {
    // 前のスタイルを縮小
    Animated.timing(animatedScales[selectedStyle], {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true
    }).start();
    
    // 新しいスタイルを拡大
    Animated.spring(animatedScales[style], {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true
    }).start();
    
    setSelectedStyle(style);
  };

  // スタイル保存と次の画面へ移動
  const handleSaveStyle = () => {
    setStyleType(selectedStyle);
    // デモのために3秒待機してから画面遷移
    setTimeout(() => {
      navigation.navigate('Main');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>スタイルの選択</Text>
        <Text style={styles.subtitle}>
          あなたの好みに合わせたデザインでアプリを使いましょう
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {styleOptions.map((option) => {
          const theme = styleThemes[option.id];
          const product = sampleProducts[option.id];
          const isSelected = selectedStyle === option.id;
          
          return (
            <Animated.View 
              key={option.id}
              style={[
                styles.cardContainer,
                {
                  transform: [{ scale: animatedScales[option.id] }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  { 
                    borderRadius: theme.radius.l,
                    borderColor: isSelected ? theme.colors.primary : '#e0e0e0',
                    borderWidth: isSelected ? 2 : 1
                  }
                ]}
                activeOpacity={0.9}
                onPress={() => handleSelectStyle(option.id)}
              >
                {/* サンプル商品カード */}
                <View style={styles.cardPreview}>
                  <View 
                    style={[
                      styles.previewImage,
                      { backgroundColor: theme.colors.surface }
                    ]}
                  >
                    <Image 
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.gradient}
                    />
                    
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.productBrand}>{product.brand}</Text>
                      <Text style={styles.productPrice}>¥{product.price.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
                
                {/* スタイル情報 */}
                <View 
                  style={[
                    styles.styleInfo,
                    { backgroundColor: isSelected ? theme.colors.background : '#ffffff' }
                  ]}
                >
                  <View style={styles.styleHeader}>
                    <Text 
                      style={[
                        styles.styleName,
                        { color: theme.colors.primary }
                      ]}
                    >
                      {option.name}
                    </Text>
                    
                    {isSelected && (
                      <View 
                        style={[
                          styles.selectedBadge,
                          { backgroundColor: theme.colors.primary }
                        ]}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                  
                  <Text 
                    style={[
                      styles.styleDescription,
                      { color: theme.colors.text.secondary }
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          isFullWidth
          onPress={handleSaveStyle}
          style={{ 
            backgroundColor: styleThemes[selectedStyle].colors.primary 
          }}
        >
          このスタイルで決定
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardPreview: {
    width: '100%',
    height: 250,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  productTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productBrand: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productPrice: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  styleInfo: {
    padding: 16,
  },
  styleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});

export default StyleSelectionScreen;
