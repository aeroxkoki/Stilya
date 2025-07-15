import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { useFilters, STYLE_OPTIONS, MOOD_OPTIONS } from '@/contexts/FilterContext';

interface SimpleFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const SimpleFilterModal: React.FC<SimpleFilterModalProps> = ({ visible, onClose }) => {
  const { theme } = useStyle();
  const { globalFilters, setPriceRange, setStyle, toggleMood, resetFilters } = useFilters();
  
  // アニメーション値
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(300);
  
  // ローカル状態（価格スライダー用）
  const [tempPriceRange, setTempPriceRange] = useState(globalFilters.priceRange);
  
  // モーダルが開いたときのアニメーション
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  // フィルターがアクティブかどうかを判定
  const isFilterActive = (): boolean => {
    return (
      globalFilters.priceRange[0] > 0 ||
      globalFilters.priceRange[1] < 50000 ||
      (globalFilters.style && globalFilters.style !== 'すべて') ||
      globalFilters.moods.length > 0
    );
  };
  
  // 価格の表示フォーマット
  const formatPrice = (price: number): string => {
    if (price === 50000) return '50,000円+';
    return `${price.toLocaleString()}円`;
  };
  
  // 適用ボタンを押したときの処理
  const handleApply = () => {
    setPriceRange(tempPriceRange);
    onClose();
  };
  
  // リセットボタンを押したときの処理
  const handleReset = () => {
    resetFilters();
    setTempPriceRange([0, 50000]);
  };
  
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { 
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.colors.background,
            }
          ]}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              フィルター
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 予算選択 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                予算
              </Text>
              <View style={styles.priceOptionsContainer}>
                {[
                  { label: '〜3,000円', range: [0, 3000] },
                  { label: '3,000〜10,000円', range: [3000, 10000] },
                  { label: '10,000〜20,000円', range: [10000, 20000] },
                  { label: '20,000円〜', range: [20000, 50000] },
                  { label: 'すべて', range: [0, 50000] },
                ].map((option) => {
                  const isSelected = 
                    tempPriceRange[0] === option.range[0] && 
                    tempPriceRange[1] === option.range[1];
                  
                  return (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.priceOption,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : 'rgba(0, 0, 0, 0.05)',
                        }
                      ]}
                      onPress={() => setTempPriceRange(option.range as [number, number])}
                    >
                      <Text
                        style={[
                          styles.priceOptionText,
                          {
                            color: isSelected
                              ? 'white'
                              : theme.colors.text.primary
                          }
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            {/* スタイル選択 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                スタイル
              </Text>
              <View style={styles.optionsContainer}>
                {STYLE_OPTIONS.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: globalFilters.style === style 
                          ? theme.colors.primary 
                          : 'rgba(0, 0, 0, 0.05)',
                      }
                    ]}
                    onPress={() => setStyle(style)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: globalFilters.style === style
                            ? 'white'
                            : theme.colors.text.primary
                        }
                      ]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* 気分タグ */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                気分
              </Text>
              <View style={styles.optionsContainer}>
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: globalFilters.moods.includes(mood)
                          ? theme.colors.primary 
                          : 'rgba(0, 0, 0, 0.05)',
                      }
                    ]}
                    onPress={() => toggleMood(mood)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: globalFilters.moods.includes(mood)
                            ? 'white'
                            : theme.colors.text.primary
                        }
                      ]}
                    >
                      {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          {/* アクションボタン */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: theme.colors.border }]}
              onPress={handleReset}
              disabled={!isFilterActive()}
            >
              <Text
                style={[
                  styles.resetButtonText,
                  { 
                    color: isFilterActive() 
                      ? theme.colors.primary 
                      : theme.colors.text.secondary 
                  }
                ]}
              >
                リセット
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>適用する</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: 320,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  priceOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 6,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 6,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SimpleFilterModal;
