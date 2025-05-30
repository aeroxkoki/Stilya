import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { View, Text, Image } from '../common/StyledComponents';

const { width, height } = Dimensions.get('window');

export interface IntroSlideProps {
  title: string;
  description: string;
  image: any;
}

const IntroSlide: React.FC<IntroSlideProps> = ({ title, description, image }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={image} 
        style={styles.image} 
        resizeMode="contain"
      />
      
      <Text style={styles.title}>
        {title}
      </Text>
      
      <Text style={styles.description}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: width * 0.7,
    height: height * 0.3,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
  },
});

export default IntroSlide;
