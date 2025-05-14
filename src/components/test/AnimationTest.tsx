// Animation Component Test
// This file is designed to test if react-native-reanimated is working correctly
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence
} from 'react-native-reanimated';

const AnimationTest = () => {
  // Test animation values with Reanimated
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Animation styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
        { translateX: translateX.value }
      ]
    };
  });

  // Test animation sequences
  const runSpringAnimation = () => {
    scale.value = withSpring(1.5, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  };

  const runRotationAnimation = () => {
    rotation.value = withSequence(
      withTiming(180, { duration: 500 }),
      withTiming(0, { duration: 500 })
    );
  };

  const runSequentialAnimation = () => {
    translateX.value = withSequence(
      withSpring(100, { damping: 10 }),
      withSpring(-100, { damping: 10 }),
      withSpring(0, { damping: 10 })
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reanimated Test</Text>
      <Animated.View style={[styles.box, animatedStyle]} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={runSpringAnimation}
        >
          <Text style={styles.buttonText}>Scale</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={runRotationAnimation}
        >
          <Text style={styles.buttonText}>Rotate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={runSequentialAnimation}
        >
          <Text style={styles.buttonText}>Move</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.info}>
        If animations work, Reanimated is configured correctly.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#3B82F6',
    borderRadius: 10
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-around',
    width: '100%'
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  info: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#666'
  }
});

export default AnimationTest;
