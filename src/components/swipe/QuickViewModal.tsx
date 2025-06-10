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
import { Product } from '../../types';
import { formatPrice } from '../../utils';
import { Button } from '../../components/common';

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
            <View style={styles.modalContainer}>
              {/* ヘッダー */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>クイックビュー</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                {/* 商品画像 */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                  />
                </View>

                {/* 商品情報 */}
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  {product.brand && (
                    <Text style={styles.productBrand}>{product.brand}</Text>
                  )}
                  <Text style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </Text>

                  {/* タグ */}
                  {product.tags && product.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {product.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* カテゴリ情報 */}
                  {product.category && (
                    <View style={styles.categoryContainer}>
                      <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                      <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* アクションボタン */}
              <View style={styles.actions}>
                {/* スワイプボタン */}
                <View style={styles.swipeActions}>
                  <TouchableOpacity
                    style={[styles.swipeButton, styles.noButton]}
                    onPress={() => {
                      onSwipeLeft();
                      onClose();
                    }}
                  >
                    <Ionicons name="close" size={28} color="#F87171" />
                    <Text style={styles.swipeButtonText}>スキップ</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.swipeButton, styles.yesButton]}
                    onPress={() => {
                      onSwipeRight();
                      onClose();
                    }}
                  >
                    <Ionicons name="heart" size={28} color="#3B82F6" />
                    <Text style={styles.swipeButtonText}>いいね</Text>
                  </TouchableOpacity>
                </View>

                {/* 詳細ボタン */}
                <Button
                  onPress={() => {
                    onViewDetails();
                    onClose();
                  }}
                  style={styles.detailButton}
                >
                  <View style={styles.detailButtonContent}>
                    <Ionicons name="eye-outline" size={20} color="white" />
                    <Text style={styles.detailButtonText}>詳細を見る</Text>
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
    backgroundColor: 'white',
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
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    marginRight: 8,
  },
  yesButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    marginLeft: 8,
  },
  swipeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#374151',
  },
  detailButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  detailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default QuickViewModal;
