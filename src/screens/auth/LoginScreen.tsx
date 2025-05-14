import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text>ログイン画面（テスト用スタブ）</Text>
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
