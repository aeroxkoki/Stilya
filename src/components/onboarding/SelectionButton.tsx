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
      className="mb-4"
    >
      <Card
        className={`p-6 ${isSelected ? 'border-2 border-primary' : ''}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {icon && <View className="mr-3">{icon}</View>}
            <View>
              <Text className="text-lg font-medium">{title}</Text>
              {subtitle && (
                <Text className="text-gray-500">{subtitle}</Text>
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

export default SelectionButton;
