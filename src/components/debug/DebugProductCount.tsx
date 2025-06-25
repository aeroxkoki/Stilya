import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '@/services/supabase';
import { useStyle } from '@/contexts/ThemeContext';
import { Button } from '@/components/common';

interface ProductStats {
  totalProducts: number;
  newProducts: number;
  usedProducts: number;
  activeProducts: number;
  categoryCounts: Record<string, number>;
}

const DebugProductCount: React.FC = () => {
  const { theme } = useStyle();
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProductStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 総商品数を取得
      const { count: totalCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true });
      
      // アクティブな商品数を取得
      const { count: activeCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      // 新品の商品数を取得
      const { count: newCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_used', false);
      
      // 中古品の商品数を取得
      const { count: usedCount } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_used', true);
      
      // カテゴリー別の商品数を取得
      const { data: categories } = await supabase
        .from('external_products')
        .select('category')
        .eq('is_active', true);
      
      const categoryCounts: Record<string, number> = {};
      if (categories) {
        categories.forEach(item => {
          const category = item.category || 'unknown';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      }
      
      setStats({
        totalProducts: totalCount || 0,
        activeProducts: activeCount || 0,
        newProducts: newCount || 0,
        usedProducts: usedCount || 0,
        categoryCounts
      });
    } catch (err) {
      console.error('Error fetching product stats:', err);
      setError('商品統計の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const clearSwipeHistory = async () => {
    try {
      const { error } = await supabase
        .from('swipes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 全件削除（ダミーID以外）
      
      if (error) throw error;
      alert('スワイプ履歴をクリアしました');
    } catch (err) {
      console.error('Error clearing swipe history:', err);
      alert('スワイプ履歴のクリアに失敗しました');
    }
  };
  
  useEffect(() => {
    fetchProductStats();
  }, []);
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>読み込み中...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>商品統計情報</Text>
        
        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        )}
        
        {stats && (
          <>
            <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>総商品数</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.totalProducts.toLocaleString()}</Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>アクティブ商品数</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{stats.activeProducts.toLocaleString()}</Text>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.halfCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>新品</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.newProducts.toLocaleString()}</Text>
              </View>
              
              <View style={[styles.halfCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>中古品</Text>
                <Text style={[styles.statValue, { color: theme.colors.secondary }]}>{stats.usedProducts.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={[styles.categorySection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>カテゴリー別商品数</Text>
              {Object.entries(stats.categoryCounts).map(([category, count]) => (
                <View key={category} style={styles.categoryRow}>
                  <Text style={[styles.categoryName, { color: theme.colors.text.secondary }]}>{category}</Text>
                  <Text style={[styles.categoryCount, { color: theme.colors.text.primary }]}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        <View style={styles.buttonSection}>
          <Button onPress={fetchProductStats} style={styles.button}>
            <Text style={styles.buttonText}>統計を更新</Text>
          </Button>
          
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: theme.colors.error }]}
            onPress={clearSwipeHistory}
          >
            <Text style={styles.buttonText}>スワイプ履歴をクリア</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    marginBottom: 10,
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  categorySection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryName: {
    fontSize: 16,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSection: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
  },
  dangerButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebugProductCount;
