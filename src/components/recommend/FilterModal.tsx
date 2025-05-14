import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  selectedTags: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  availableTags: string[];
}

// カテゴリーの表示名マッピング
const CATEGORY_LABELS: Record<string, string> = {
  'tops': 'トップス',
  'bottoms': 'ボトムス',
  'outerwear': 'アウター',
  'accessories': 'アクセサリー',
  'shoes': 'シューズ',
  'bags': 'バッグ',
  'dresses': 'ワンピース',
  'sets': 'セットアップ'
};

// 利用可能なカテゴリー
const AVAILABLE_CATEGORIES = [
  'tops', 'bottoms', 'outerwear', 'accessories', 'shoes', 'bags', 'dresses', 'sets'
];

// 価格帯の選択肢
const PRICE_RANGES: [number, number][] = [
  [0, 3000],
  [3000, 5000],
  [5000, 10000],
  [10000, 20000],
  [20000, Infinity]
];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  availableTags
}) => {
  // フィルター状態
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    categories: [],
    priceRange: [0, Infinity],
    selectedTags: []
  });

  // カテゴリー選択の切り替え
  const toggleCategory = (category: string) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  // 価格帯選択
  const selectPriceRange = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  // タグ選択の切り替え
  const toggleTag = (tag: string) => {
    setFilters(prev => {
      if (prev.selectedTags.includes(tag)) {
        return {
          ...prev,
          selectedTags: prev.selectedTags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          selectedTags: [...prev.selectedTags, tag]
        };
      }
    });
  };

  // フィルターのリセット
  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: []
    });
  };

  // フィルターの適用
  const applyFilters = () => {
    onApply(filters);
    onClose();
  };

  // 価格帯の表示テキスト
  const getPriceRangeText = (range: [number, number]): string => {
    if (range[1] === Infinity) {
      return `${range[0].toLocaleString()}円以上`;
    }
    return `${range[0].toLocaleString()}円 〜 ${range[1].toLocaleString()}円`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* ヘッダー */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>フィルター</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent}>
            {/* カテゴリーセクション */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>カテゴリー</Text>
              <View style={styles.tagContainer}>
                {AVAILABLE_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.tagButton,
                      filters.categories.includes(category) ? styles.tagActive : styles.tagInactive
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text
                      style={filters.categories.includes(category) ? styles.tagTextActive : styles.tagTextInactive}
                    >
                      {CATEGORY_LABELS[category] || category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* 価格帯セクション */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>価格帯</Text>
              <View>
                {PRICE_RANGES.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceButton,
                      filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1] 
                        ? styles.priceActive : styles.priceInactive
                    ]}
                    onPress={() => selectPriceRange(range)}
                  >
                    <Text
                      style={
                        filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
                          ? styles.priceTextActive
                          : styles.priceTextInactive
                      }
                    >
                      {getPriceRangeText(range)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* タグセクション */}
            {availableTags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>スタイル・特徴</Text>
                <View style={styles.tagContainer}>
                  {availableTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.styleTags,
                        filters.selectedTags.includes(tag) ? styles.tagActive : styles.tagInactive
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        style={[
                          filters.selectedTags.includes(tag) ? styles.tagTextActive : styles.tagTextInactive,
                          styles.smallText
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* ボタン部分 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>リセット</Text>
            </TouchableOpacity>
            <Button
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>適用する</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    margin: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  styleTags: {
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tagInactive: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  tagTextActive: {
    color: 'white',
  },
  tagTextInactive: {
    color: '#333333',
  },
  smallText: {
    fontSize: 14,
  },
  priceButton: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceActive: {
    backgroundColor: '#ebf5ff',
    borderColor: '#93c5fd',
  },
  priceInactive: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  priceTextActive: {
    color: '#1d4ed8',
  },
  priceTextInactive: {
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2563eb',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FilterModal;
