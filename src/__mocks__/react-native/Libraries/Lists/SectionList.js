/**
 * SectionList Mock
 */

import React from 'react';

const SectionList = jest.fn((props) => {
  return React.createElement('SectionList', props, props.children);
});

export default SectionList;
