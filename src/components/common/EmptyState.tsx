import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';

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
  iconColor,
}) => {
  const { theme } = useStyle();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Ionicons 
        name={icon as any} 
        size={64} 
        color={iconColor || theme.colors.status.info} 
      />
      
      {title && (
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
      )}
      
      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
        {message}
      </Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity
          style={[
            styles.button, 
            { 
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            }
          ]}
          onPress={onButtonPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text.inverse }]}>
            {buttonText}
          </Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
