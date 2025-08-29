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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { useFilters, CATEGORY_OPTIONS } from '@/contexts/FilterContext';

interface SimpleFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const SimpleFilterModal: React.FC<SimpleFilterModalProps> = ({ visible, onClose }) => {
  const { theme } = useStyle();
  const { globalFilters, setPriceRange, toggleCategory, resetFilters, setIncludeUsed, clearCategories } = useFilters();
  
  // アニメーション値
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(300);
  
  // ローカル状態（価格スライダー用）
  const [tempPriceRange, setTempPriceRange] = useState(globalFilters.priceRange);
  const [tempIncludeUsed, setTempIncludeUsed] = useState(globalFilters.includeUsed ?? true);
  
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
      globalFilters.categories.length > 0 ||
      globalFilters.includeUsed === false
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
    setIncludeUsed(tempIncludeUsed);
    onClose();
  };
  
  // リセットボタンを押したときの処理
  const handleReset = () => {
    resetFilters();
    setTempPriceRange([0, 50000]);
    setTempIncludeUsed(true);
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
                            : theme.colors.surface,
                          borderColor: isSelected 
                            ? theme.colors.primary 
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => setTempPriceRange(option.range as [number, number])}
                    >
                      <Text 
                        style={[
                          styles.priceOptionText,
                          { 
                            color: isSelected 
                              ? '#fff' 
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
            
            {/* カテゴリー選択（服の種類） */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  服の種類
                </Text>
                {globalFilters.categories.length > 0 && (
                  <TouchableOpacity onPress={clearCategories}>
                    <Text style={[styles.clearText, { color: theme.colors.primary }]}>
                      クリア
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
                複数選択可能
              </Text>
              <View style={styles.categoryOptionsContainer}>
                {CATEGORY_OPTIONS.map((category) => {
                  const isSelected = globalFilters.categories.includes(category);
                  // カテゴリーに応じたアイコンを設定
                  const getIcon = () => {
                    switch(category) {
                      case 'トップス': return '👔';
                      case 'シャツ': return '👔';
                      case 'ニット': return '🧶';
                      case 'ブラウス': return '👚';
                      case 'パンツ': return '👖';
                      case 'スカート': return '👗';
                      case 'ワンピース': return '👗';
                      case 'ジャケット': return '🧥';
                      case 'コート': return '🧥';
                      default: return '';
                    }
                  };
                  
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor: isSelected 
                            ? theme.colors.primary + '15'
                            : theme.colors.surface,
                          borderColor: isSelected 
                            ? theme.colors.primary 
                            : theme.colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        }
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text 
                        style={[
                          styles.categoryOptionText,
                          { 
                            color: isSelected 
                              ? theme.colors.primary 
                              : theme.colors.text.primary
                          }
                        ]}
                      >
                        {getIcon()} {category}
                      </Text>
                      {isSelected && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={16} 
                          color={theme.colors.primary} 
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            {/* 中古品を含む */}
            <View style={styles.section}>
              <View style={styles.usedOptionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  中古品を含む
                </Text>
                <Switch
                  value={tempIncludeUsed}
                  onValueChange={setTempIncludeUsed}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
                  thumbColor={tempIncludeUsed ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
          
          {/* フッター */}
          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.footerButton, styles.resetButton]}
              onPress={handleReset}
              disabled={!isFilterActive()}
            >
              <Text 
                style={[
                  styles.resetButtonText, 
                  { 
                    color: isFilterActive() 
                      ? theme.colors.primary 
                      : theme.colors.text.disabled 
                  }
                ]}
              >
                リセット
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.footerButton, 
                styles.applyButton,
                { backgroundColor: theme.colors.primary }
              ]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                {isFilterActive() ? '適用する' : '閉じる'}
              </Text>
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
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  priceOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  priceOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  usedOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SimpleFilterModal;
