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
import { useFilters, STYLE_OPTIONS, MOOD_OPTIONS } from '@/contexts/FilterContext';

interface SimpleFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const SimpleFilterModal: React.FC<SimpleFilterModalProps> = ({ visible, onClose }) => {
  const { theme } = useStyle();
  const { globalFilters, setPriceRange, toggleStyle, toggleMood, resetFilters, setIncludeUsed, clearStyles } = useFilters();
  
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
      globalFilters.styles.length > 0 ||
      globalFilters.moods.length > 0 ||
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
            
            {/* スタイル選択（複数選択可能） */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  スタイル
                </Text>
                {globalFilters.styles.length > 0 && (
                  <TouchableOpacity onPress={clearStyles}>
                    <Text style={[styles.clearText, { color: theme.colors.primary }]}>
                      クリア
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
                複数選択可能
              </Text>
              <View style={styles.styleOptionsContainer}>
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = globalFilters.styles.includes(style);
                  
                  return (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.styleOption,
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
                      onPress={() => toggleStyle(style)}
                    >
                      <Text 
                        style={[
                          styles.styleOptionText,
                          { 
                            color: isSelected 
                              ? theme.colors.primary 
                              : theme.colors.text.primary
                          }
                        ]}
                      >
                        {style}
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
            
            {/* 気分タグ */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                気分
              </Text>
              <View style={styles.moodOptionsContainer}>
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = globalFilters.moods.includes(mood);
                  
                  return (
                    <TouchableOpacity
                      key={mood}
                      style={[
                        styles.moodOption,
                        {
                          backgroundColor: isSelected 
                            ? theme.colors.secondary + '15'
                            : theme.colors.surface,
                          borderColor: isSelected 
                            ? theme.colors.secondary 
                            : theme.colors.border,
                        }
                      ]}
                      onPress={() => toggleMood(mood)}
                    >
                      <Text 
                        style={[
                          styles.moodOptionText,
                          { 
                            color: isSelected 
                              ? theme.colors.secondary 
                              : theme.colors.text.primary
                          }
                        ]}
                      >
                        {mood === '新着' && '🆕 '}
                        {mood === '人気' && '🔥 '}
                        {mood === 'セール' && '💰 '}
                        {mood}
                      </Text>
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
  styleOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  styleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  moodOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  moodOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodOptionText: {
    fontSize: 14,
    fontWeight: '500',
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
