/**
 * SectionList Mock
 */

import React from 'react';

const SectionList = jest.fn((props) => {
  return React.createElement('SectionList', props, props.children);
});

// 必要なメソッドを追加
SectionList.scrollToLocation = jest.fn();
SectionList.recordInteraction = jest.fn();
SectionList.flashScrollIndicators = jest.fn();

export default SectionList;
