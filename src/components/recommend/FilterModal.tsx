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
      <View className="flex-1 bg-black/30 justify-end">
        <View className="bg-white rounded-t-3xl min-h-[60%] max-h-[90%]">
          {/* ヘッダー */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
            <Text className="text-xl font-bold">フィルター</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 px-5 py-4">
            {/* カテゴリーセクション */}
            <View className="mb-6">
              <Text className="text-base font-bold mb-3">カテゴリー</Text>
              <View className="flex-row flex-wrap">
                {AVAILABLE_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    className={`m-1 px-4 py-2 rounded-full border ${
                      filters.categories.includes(category)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text
                      className={`${
                        filters.categories.includes(category) ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {CATEGORY_LABELS[category] || category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* 価格帯セクション */}
            <View className="mb-6">
              <Text className="text-base font-bold mb-3">価格帯</Text>
              <View>
                {PRICE_RANGES.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`mb-2 px-4 py-3 rounded-lg ${
                      filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onPress={() => selectPriceRange(range)}
                  >
                    <Text
                      className={`${
                        filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
                          ? 'text-blue-700'
                          : 'text-gray-800'
                      }`}
                    >
                      {getPriceRangeText(range)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* タグセクション */}
            {availableTags.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-bold mb-3">スタイル・特徴</Text>
                <View className="flex-row flex-wrap">
                  {availableTags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      className={`m-1 px-3 py-1 rounded-full border ${
                        filters.selectedTags.includes(tag)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-gray-100 border-gray-200'
                      }`}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        className={`${
                          filters.selectedTags.includes(tag) ? 'text-white' : 'text-gray-800'
                        } text-sm`}
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
          <View className="px-5 py-4 border-t border-gray-200 flex-row">
            <TouchableOpacity
              className="flex-1 mr-2 py-3 border border-gray-300 rounded-lg items-center"
              onPress={resetFilters}
            >
              <Text className="text-gray-700 font-medium">リセット</Text>
            </TouchableOpacity>
            <Button
              className="flex-1 bg-blue-600"
              onPress={applyFilters}
            >
              <Text className="text-white font-bold">適用する</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
