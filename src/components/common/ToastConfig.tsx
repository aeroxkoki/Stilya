import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

/**
 * Toastのカスタムスタイル設定
 */
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#22C55E',
        backgroundColor: '#F0FDF4',
        width: '90%',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 8,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
      }}
      text2Style={{
        fontSize: 12,
        color: '#166534',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
        </View>
      )}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        backgroundColor: '#FEF2F2',
        width: '90%',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 8,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#991B1B',
      }}
      text2Style={{
        fontSize: 12,
        color: '#991B1B',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
        </View>
      )}
    />
  ),

  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
        width: '90%',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 8,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
      }}
      text2Style={{
        fontSize: 12,
        color: '#1E40AF',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
        </View>
      )}
    />
  ),

  warning: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#F59E0B',
        backgroundColor: '#FFFBEB',
        width: '90%',
        height: 'auto',
        minHeight: 60,
        paddingVertical: 8,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
      }}
      text2Style={{
        fontSize: 12,
        color: '#92400E',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

export default toastConfig;
