/**
 * VirtualizedList Mock
 */

import React from 'react';

const VirtualizedList = jest.fn((props) => {
  return React.createElement('VirtualizedList', props, props.children);
});

// 必要なメソッドを追加
VirtualizedList.getItem = jest.fn();
VirtualizedList.getItemCount = jest.fn();
VirtualizedList.scrollToIndex = jest.fn();
VirtualizedList.scrollToItem = jest.fn();
VirtualizedList.scrollToOffset = jest.fn();
VirtualizedList.recordInteraction = jest.fn();
VirtualizedList.flashScrollIndicators = jest.fn();

export default VirtualizedList;
