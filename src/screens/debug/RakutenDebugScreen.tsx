import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import { fetchRakutenFashionProducts } from '@/services/rakutenService';
import { fetchProducts } from '@/services/productService';
import { supabase } from '@/services/supabase';

interface DebugInfo {
  envVars: {
    rakutenAppId: boolean;
    rakutenAffiliateId: boolean;
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
  };
  apiTest: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    data?: any;
  };
  productServiceTest: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    data?: any;
  };
  supabaseTest: {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    data?: any;
  };
}

export const RakutenDebugScreen: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    envVars: {
      rakutenAppId: !!RAKUTEN_APP_ID,
      rakutenAffiliateId: !!RAKUTEN_AFFILIATE_ID,
      supabaseUrl: !!SUPABASE_URL,
      supabaseAnonKey: !!SUPABASE_ANON_KEY,
    },
    apiTest: { status: 'idle', message: '' },
    productServiceTest: { status: 'idle', message: '' },
    supabaseTest: { status: 'idle', message: '' },
  });

  // 楽天API直接テスト
  const testRakutenAPI = async () => {
    setDebugInfo(prev => ({
      ...prev,
      apiTest: { status: 'loading', message: 'テスト中...' },
    }));

    try {
      const result = await fetchRakutenFashionProducts(
        undefined,  // keyword
        100371,     // genreId
        1,          // page
        5,          // hits
        true        // forceRefresh
      );

      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          status: 'success',
          message: `成功: ${result.products.length}件の商品を取得`,
          data: result,
        },
      }));
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        apiTest: {
          status: 'error',
          message: `エラー: ${error.message}`,
          data: error,
        },
      }));
    }
  };

  // ProductService経由のテスト
  const testProductService = async () => {
    setDebugInfo(prev => ({
      ...prev,
      productServiceTest: { status: 'loading', message: 'テスト中...' },
    }));

    try {
      const result = await fetchProducts(5, 0);

      setDebugInfo(prev => ({
        ...prev,
        productServiceTest: {
          status: 'success',
          message: `成功: ${result.data?.length || 0}件の商品を取得`,
          data: result,
        },
      }));
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        productServiceTest: {
          status: 'error',
          message: `エラー: ${error.message}`,
          data: error,
        },
      }));
    }
  };

  // Supabase接続テスト
  const testSupabase = async () => {
    setDebugInfo(prev => ({
      ...prev,
      supabaseTest: { status: 'loading', message: 'テスト中...' },
    }));

    try {
      const { data, error } = await supabase
        .from('external_products')
        .select('id')
        .limit(1);

      if (error) {
        setDebugInfo(prev => ({
          ...prev,
          supabaseTest: {
            status: 'error',
            message: `エラー: ${error.message}`,
            data: error,
          },
        }));
      } else {
        setDebugInfo(prev => ({
          ...prev,
          supabaseTest: {
            status: 'success',
            message: 'Supabase接続成功',
            data: { connected: true, hasData: data && data.length > 0 },
          },
        }));
      }
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        supabaseTest: {
          status: 'error',
          message: `エラー: ${error.message}`,
          data: error,
        },
      }));
    }
  };

  const renderTestResult = (test: typeof debugInfo.apiTest) => {
    const colors = {
      idle: '#666',
      loading: '#007AFF',
      success: '#4CAF50',
      error: '#F44336',
    };

    return (
      <View style={styles.testResult}>
        <Text style={[styles.statusText, { color: colors[test.status] }]}>
          {test.status === 'loading' && <ActivityIndicator size="small" />}
          {test.message}
        </Text>
        {test.data && test.status === 'error' && (
          <Text style={styles.errorDetail}>
            {JSON.stringify(test.data, null, 2)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>楽天API デバッグ画面</Text>

        {/* 環境変数チェック */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>環境変数</Text>
          <View style={styles.envVarsList}>
            <Text style={styles.envVar}>
              RAKUTEN_APP_ID: {debugInfo.envVars.rakutenAppId ? '✅ 設定済み' : '❌ 未設定'}
            </Text>
            <Text style={styles.envVar}>
              RAKUTEN_AFFILIATE_ID: {debugInfo.envVars.rakutenAffiliateId ? '✅ 設定済み' : '❌ 未設定'}
            </Text>
            <Text style={styles.envVar}>
              SUPABASE_URL: {debugInfo.envVars.supabaseUrl ? '✅ 設定済み' : '❌ 未設定'}
            </Text>
            <Text style={styles.envVar}>
              SUPABASE_ANON_KEY: {debugInfo.envVars.supabaseAnonKey ? '✅ 設定済み' : '❌ 未設定'}
            </Text>
          </View>
        </View>

        {/* 楽天API直接テスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>楽天API直接テスト</Text>
          <TouchableOpacity style={styles.button} onPress={testRakutenAPI}>
            <Text style={styles.buttonText}>テスト実行</Text>
          </TouchableOpacity>
          {renderTestResult(debugInfo.apiTest)}
        </View>

        {/* ProductService経由テスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ProductService経由テスト</Text>
          <TouchableOpacity style={styles.button} onPress={testProductService}>
            <Text style={styles.buttonText}>テスト実行</Text>
          </TouchableOpacity>
          {renderTestResult(debugInfo.productServiceTest)}
        </View>

        {/* Supabase接続テスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supabase接続テスト</Text>
          <TouchableOpacity style={styles.button} onPress={testSupabase}>
            <Text style={styles.buttonText}>テスト実行</Text>
          </TouchableOpacity>
          {renderTestResult(debugInfo.supabaseTest)}
        </View>

        {/* 実際の値（開発環境のみ） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>実際の値（デバッグ用）</Text>
          <Text style={styles.debugValue}>
            RAKUTEN_APP_ID: {RAKUTEN_APP_ID || '(empty)'}
          </Text>
          <Text style={styles.debugValue}>
            RAKUTEN_AFFILIATE_ID: {RAKUTEN_AFFILIATE_ID ? RAKUTEN_AFFILIATE_ID.substring(0, 20) + '...' : '(empty)'}
          </Text>
          <Text style={styles.debugValue}>
            SUPABASE_URL: {SUPABASE_URL || '(empty)'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  envVarsList: {
    marginTop: 10,
  },
  envVar: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testResult: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  errorDetail: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  debugValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#666',
  },
});

export default RakutenDebugScreen;
