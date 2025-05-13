import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  title?: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  icon?: string;
  iconColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  buttonText,
  onButtonPress,
  icon = 'information-circle-outline',
  iconColor = '#3B82F6',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={iconColor} />
      
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Text style={styles.message}>{message}</Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity
          style={styles.button}
          onPress={onButtonPress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
