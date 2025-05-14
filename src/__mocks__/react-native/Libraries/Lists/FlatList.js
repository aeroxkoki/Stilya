/**
 * FlatList Mock
 */

import React from 'react';

const FlatList = jest.fn((props) => {
  return React.createElement('FlatList', props, props.children);
});

// 必要なメソッドを追加
FlatList.scrollToEnd = jest.fn();
FlatList.scrollToIndex = jest.fn();
FlatList.scrollToItem = jest.fn();
FlatList.scrollToOffset = jest.fn();

export default FlatList;
