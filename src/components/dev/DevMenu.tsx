import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { runLocalTests } from '../../tests/localTests';
import { NetworkDiagnostics } from './NetworkDiagnostics';
import { SupabaseConnectionTest } from '../SupabaseConnectionTest';
import { runDeviceDiagnostics } from '../../tests/deviceDiagnostics';
import { ConnectionDiagnostics } from './ConnectionDiagnostics';

interface DevMenuProps {
  onClose: () => void;
}

/**
 * 開発メニューコンポーネント
 * MVPテストとネットワーク診断を実行するためのUIを提供
 */
export const DevMenu: React.FC<DevMenuProps> = ({ onClose }) => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [showNetworkDiagnostics, setShowNetworkDiagnostics] = React.useState(false);
  const [showSupabaseTest, setShowSupabaseTest] = React.useState(false);
  const [showConnectionDiagnostics, setShowConnectionDiagnostics] = React.useState(false);

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

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    setTestResults(['診断実行中...']);
    
    // コンソールログをキャプチャ
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      await runDeviceDiagnostics();
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
    <>
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

          <TouchableOpacity
            style={[styles.button, isRunning && styles.buttonDisabled, { backgroundColor: '#FF9800' }]}
            onPress={handleRunDiagnostics}
            disabled={isRunning}
          >
            <Text style={styles.buttonText}>
              {isRunning ? '⏳ 診断実行中...' : '🔍 エラー診断を実行'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowNetworkDiagnostics(true)}
          >
            <Text style={styles.buttonText}>
              🌐 ネットワーク診断
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowSupabaseTest(true)}
          >
            <Text style={styles.buttonText}>
              🔌 Supabase接続テスト
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={() => setShowConnectionDiagnostics(true)}
          >
            <Text style={styles.buttonText}>
              🩺 詳細接続診断
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

      <Modal
        visible={showNetworkDiagnostics}
        animationType="slide"
        onRequestClose={() => setShowNetworkDiagnostics(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowNetworkDiagnostics(false)}
          >
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
          <NetworkDiagnostics />
        </View>
      </Modal>

      <Modal
        visible={showSupabaseTest}
        animationType="slide"
        onRequestClose={() => setShowSupabaseTest(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSupabaseTest(false)}
          >
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
          <SupabaseConnectionTest />
        </View>
      </Modal>

      <Modal
        visible={showConnectionDiagnostics}
        animationType="slide"
        onRequestClose={() => setShowConnectionDiagnostics(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowConnectionDiagnostics(false)}
          >
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
          <ConnectionDiagnostics />
        </View>
      </Modal>
    </>
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
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  resultText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
