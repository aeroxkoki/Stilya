import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { Button } from '@/components/common';

interface QuickViewModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onViewDetails: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;
const MODAL_HEIGHT = height * 0.7;

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  visible,
  product,
  onClose,
  onViewDetails,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const { theme } = useStyle();
  
  if (!product) return null;

  const imageUrl = product.imageUrl || product.image_url || 'https://via.placeholder.com/350x500?text=No+Image';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
              {/* ヘッダー */}
              <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>クイックビュー</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* 商品画像 */}
                <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface }]}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>

                {/* 商品情報 */}
                <View style={styles.productInfo}>
                  <Text style={[styles.productTitle, { color: theme.colors.text.primary }]}>{product.title}</Text>
                  {product.brand && (
                    <Text style={[styles.productBrand, { color: theme.colors.text.secondary }]}>{product.brand}</Text>
                  )}
                  <Text style={[styles.productPrice, { color: theme.colors.text.primary }]}>
                    {formatPrice(product.price)}
                  </Text>

                  {/* タグ */}
                  {product.tags && product.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {product.tags.map((tag, index) => (
                        <View key={index} style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                          <Text style={[styles.tagText, { color: theme.colors.text.secondary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* カテゴリ情報 */}
                  {product.category && (
                    <View style={styles.categoryContainer}>
                      <Ionicons name="pricetag-outline" size={16} color={theme.colors.text.secondary} />
                      <Text style={[styles.categoryText, { color: theme.colors.text.secondary }]}>{product.category}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* アクションボタン */}
              <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
                {/* スワイプボタン */}
                <View style={styles.swipeActions}>
                  <TouchableOpacity
                    style={[
                      styles.swipeButton, 
                      styles.noButton,
                      { 
                        backgroundColor: `${theme.colors.error}10`,
                        borderColor: `${theme.colors.error}30`,
                      }
                    ]}
                    onPress={() => {
                      onSwipeLeft();
                      onClose();
                    }}
                  >
                    <Ionicons name="close" size={28} color={theme.colors.error} />
                    <Text style={[styles.swipeButtonText, { color: theme.colors.text.primary }]}>スキップ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.swipeButton, 
                      styles.yesButton,
                      { 
                        backgroundColor: `${theme.colors.primary}10`,
                        borderColor: `${theme.colors.primary}30`,
                      }
                    ]}
                    onPress={() => {
                      onSwipeRight();
                      onClose();
                    }}
                  >
                    <Ionicons name="heart" size={28} color={theme.colors.primary} />
                    <Text style={[styles.swipeButtonText, { color: theme.colors.text.primary }]}>いいね</Text>
                  </TouchableOpacity>
                </View>

                {/* 詳細ボタン */}
                <Button
                  onPress={() => {
                    onViewDetails();
                    onClose();
                  }}
                  style={[styles.detailButton, { backgroundColor: theme.colors.primary }]}
                >
                  <View style={styles.detailButtonContent}>
                    <Ionicons name="eye-outline" size={20} color={theme.colors.text.inverse} />
                    <Text style={[styles.detailButtonText, { color: theme.colors.text.inverse }]}>詳細を見る</Text>
                  </View>
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxHeight: MODAL_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 4,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  swipeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  noButton: {
    marginRight: 8,
  },
  yesButton: {
    marginLeft: 8,
  },
  swipeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  detailButton: {
    borderRadius: 8,
  },
  detailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default QuickViewModal;
