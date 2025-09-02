import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { supabase } from '@/services/supabase';
import { Image as ExpoImage } from 'expo-image';

const ImageDebugScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('[ImageDebugScreen] Loading products...');
      
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title, image_url, brand')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .limit(5);

      if (error) {
        console.error('[ImageDebugScreen] Error loading products:', error);
        return;
      }

      console.log('[ImageDebugScreen] Loaded products:', data?.length);
      
      if (data) {
        data.forEach((product, index) => {
          console.log(`[ImageDebugScreen] Product ${index + 1}:`, {
            id: product.id,
            title: product.title.substring(0, 50),
            image_url: product.image_url,
          });
        });
      }

      setProducts(data || []);
    } catch (err) {
      console.error('[ImageDebugScreen] Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId: string, error: any) => {
    console.error(`[ImageDebugScreen] Image error for ${productId}:`, error);
    setErrors(prev => ({
      ...prev,
      [productId]: error?.nativeEvent?.error || 'Unknown error'
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Image Debug Screen</Text>
      <Text style={styles.subtitle}>Testing image loading from Supabase</Text>

      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productId}>ID: {product.id}</Text>
          <Text style={styles.imageUrl}>URL: {product.image_url?.substring(0, 100)}...</Text>
          
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>React Native Image:</Text>
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              onError={(e) => handleImageError(`rn-${product.id}`, e)}
              onLoad={() => console.log(`[ImageDebugScreen] RN Image loaded: ${product.id}`)}
            />
            {errors[`rn-${product.id}`] && (
              <Text style={styles.errorText}>Error: {errors[`rn-${product.id}`]}</Text>
            )}
          </View>

          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Expo Image:</Text>
            <ExpoImage
              source={{ uri: product.image_url }}
              style={styles.image}
              contentFit="cover"
              onError={(e) => handleImageError(`expo-${product.id}`, e)}
              onLoad={() => console.log(`[ImageDebugScreen] Expo Image loaded: ${product.id}`)}
            />
            {errors[`expo-${product.id}`] && (
              <Text style={styles.errorText}>Error: {errors[`expo-${product.id}`]}</Text>
            )}
          </View>
        </View>
      ))}

      {products.length === 0 && (
        <Text style={styles.noProductsText}>No products found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  imageUrl: {
    fontSize: 10,
    color: '#999',
    marginBottom: 12,
  },
  imageContainer: {
    marginVertical: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
});

export default ImageDebugScreen;
