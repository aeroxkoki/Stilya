// expo-image.js
// expo-image モジュールのモック
const React = require('react');

// Imageコンポーネントのモック
const Image = function(props) {
  return React.createElement('Image', props, props.children);
};

// Imageスタティックメソッドの追加
Image.prefetch = jest.fn(() => Promise.resolve(true));
Image.clearMemoryCache = jest.fn(() => Promise.resolve());
Image.clearDiskCache = jest.fn(() => Promise.resolve());

// ImageBackgroundコンポーネントのモック
const ImageBackground = function(props) {
  return React.createElement('ImageBackground', props, props.children);
};

module.exports = {
  Image,
  ImageBackground,
  ContentFit: {
    COVER: 'cover',
    CONTAIN: 'contain',
    FILL: 'fill',
    NONE: 'none',
    SCALE_DOWN: 'scale-down',
  },
  ContentPosition: {
    CENTER: 'center',
  },
};