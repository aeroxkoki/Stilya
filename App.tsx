import React from 'react';
import { Text, View } from 'react-native';

console.log('[App.tsx] Simple test version starting...');

const App: React.FC = () => {
  console.log('[App.tsx] App component rendering...');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Stilya Test Mode
      </Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>
        最小限のアプリケーション
      </Text>
    </View>
  );
};

export default App;
