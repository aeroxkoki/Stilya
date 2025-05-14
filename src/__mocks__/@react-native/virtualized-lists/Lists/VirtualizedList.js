/**
 * VirtualizedList Mock
 */

import React from 'react';

const VirtualizedList = jest.fn((props) => {
  return React.createElement('VirtualizedList', props, props.children);
});

export default VirtualizedList;
