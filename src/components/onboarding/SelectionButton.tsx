import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common';
import { View, Text, TouchableOpacity } from '../common/StyledComponents';

interface SelectionButtonProps {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  title,
  subtitle,
  isSelected,
  onPress,
  icon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.touchable}
    >
      <Card
        variant={isSelected ? 'elevated' : 'outlined'}
        style={[
          styles.card,
          isSelected && styles.cardSelected
        ]}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <View>
              <Text style={[styles.title, isSelected && styles.titleSelected]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, isSelected && styles.subtitleSelected]}>{subtitle}</Text>
              )}
            </View>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  cardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleSelected: {
    color: '#3B82F6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  subtitleSelected: {
    color: '#60A5FA',
  },
});

export default SelectionButton;
