import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface IntroSlideProps {
  title: string;
  description: string;
  image: any;
}

const IntroSlide: React.FC<IntroSlideProps> = ({ title, description, image }) => {
  return (
    <View className="items-center justify-center px-6">
      <Image 
        source={image} 
        style={styles.image} 
        resizeMode="contain"
      />
      
      <Text className="text-2xl font-bold text-center mt-8 mb-3">
        {title}
      </Text>
      
      <Text className="text-gray-600 text-center leading-6">
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 0.7,
    height: height * 0.3,
  },
});

export default IntroSlide;
