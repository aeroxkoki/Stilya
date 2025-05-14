import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const RegisterScreen = () => {
  return (
    <View style={styles.container}>
      <Text>新規登録画面（テスト用スタブ）</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
