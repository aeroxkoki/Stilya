import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';

interface ActionButtonsProps {
  onPressNo: () => void;
  onPressYes: () => void;
  disabled?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_SIZE = 60;
const ICON_SIZE = 30;

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPressNo,
  onPressYes,
  disabled = false,
}) => {
  const theme = useStyle();
  const scaleNo = new Animated.Value(1);
  const scaleYes = new Animated.Value(1);

  const animatePress = (scale: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  const handlePressNo = () => {
    if (!disabled) {
      animatePress(scaleNo, onPressNo);
    }
  };

  const handlePressYes = () => {
    if (!disabled) {
      animatePress(scaleYes, onPressYes);
    }
  };

  return (
    <View style={styles.container}>
      {/* NOボタン */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: scaleNo }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            styles.noButton,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.error,
            },
            disabled && styles.disabledButton,
          ]}
          onPress={handlePressNo}
          disabled={disabled}
          testID="action-button-no"
        >
          <Ionicons
            name="close"
            size={ICON_SIZE}
            color={disabled ? theme.colors.text.disabled : theme.colors.error}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* YESボタン */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: scaleYes }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            styles.yesButton,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.success,
            },
            disabled && styles.disabledButton,
          ]}
          onPress={handlePressYes}
          disabled={disabled}
          testID="action-button-yes"
        >
          <Ionicons
            name="heart"
            size={ICON_SIZE}
            color={disabled ? theme.colors.text.disabled : theme.colors.success}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.2,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  noButton: {
    // 個別のスタイル（必要に応じて）
  },
  yesButton: {
    // 個別のスタイル（必要に応じて）
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ActionButtons;
