import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { runLocalTests } from '../../tests/localTests';

interface DevMenuProps {
  onClose: () => void;
}

/**
 * 開発メニューコンポーネント
 * MVPテストを実行するためのUIを提供
 */
export const DevMenu: React.FC<DevMenuProps> = ({ onClose }) => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults(['テスト実行中...']);
    
    // コンソールログをキャプチャ
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      await runLocalTests();
      setTestResults(logs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestResults([...logs, `エラー: ${errorMessage}`]);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛠️ 開発メニュー</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={handleRunTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '⏳ テスト実行中...' : '🧪 MVPテストを実行'}
          </Text>
        </TouchableOpacity>

        <ScrollView style={styles.results}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
