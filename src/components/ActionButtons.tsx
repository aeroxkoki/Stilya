import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ActionButtonsProps {
  onPressNo: () => void;
  onPressYes: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onPressNo, onPressYes }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.noButton]}
        onPress={onPressNo}
      >
        <Feather name="x" size={30} color="#F44336" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.yesButton]}
        onPress={onPressYes}
      >
        <Feather name="check" size={30} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 50,
    width: '100%',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  yesButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
});

export default ActionButtons;
