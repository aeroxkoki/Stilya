// React Native開発環境のデバッグ情報を確認するコンポーネント
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Constants from 'expo-constants';
import { supabase } from '@/services/supabase';
import { optimizeImageUrl } from '@/utils/imageUtils';

export const DebugInfoScreen = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testProduct, setTestProduct] = useState<any>(null);

  useEffect(() => {
    const collectDebugInfo = async () => {
      // 環境変数とデバッグフラグの確認
      const envInfo = {
        __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined',
        NODE_ENV: process.env.NODE_ENV,
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        expoConfig: Constants.default?.expoConfig?.extra,
      };

      // Supabaseから商品を1件取得してテスト
      try {
        const { data, error } = await supabase
          .from('external_products')
          .select('*')
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .not('image_url', 'eq', '')
          .limit(1)
          .single();

        if (data && !error) {
          const originalUrl = data.image_url;
          const optimizedUrl = optimizeImageUrl(originalUrl);
          
          setTestProduct({
            id: data.id,
            title: data.title,
            originalUrl,
            optimizedUrl,
            urlChanged: originalUrl !== optimizedUrl,
            dbFields: Object.keys(data),
          });
        }
      } catch (err) {
        console.error('Test product fetch error:', err);
      }

      setDebugInfo(envInfo);
    };

    collectDebugInfo();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 デバッグ情報</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>環境変数とフラグ</Text>
        <Text style={styles.info}>__DEV__: {String(debugInfo.__DEV__)}</Text>
        <Text style={styles.info}>NODE_ENV: {debugInfo.NODE_ENV || 'undefined'}</Text>
        <Text style={styles.info}>Supabase URL: {debugInfo.EXPO_PUBLIC_SUPABASE_URL || 'undefined'}</Text>
        <Text style={styles.info}>Supabase Key: {debugInfo.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'undefined'}</Text>
      </View>

      {testProduct && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>商品データテスト</Text>
          <Text style={styles.info}>ID: {testProduct.id}</Text>
          <Text style={styles.info}>タイトル: {testProduct.title}</Text>
          <Text style={styles.info}>元の画像URL: {testProduct.originalUrl}</Text>
          <Text style={styles.info}>最適化後URL: {testProduct.optimizedUrl}</Text>
          <Text style={styles.info}>URL変更: {testProduct.urlChanged ? 'あり' : 'なし'}</Text>
          <Text style={styles.info}>DBフィールド: {testProduct.dbFields.join(', ')}</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>デバッグログ設定</Text>
        <Text style={styles.info}>
          {__DEV__ ? 'デバッグログは有効です' : 'デバッグログは無効です'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginVertical: 2,
    fontFamily: 'monospace',
  },
});
