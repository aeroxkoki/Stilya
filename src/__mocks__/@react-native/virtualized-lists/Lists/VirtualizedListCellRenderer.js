/**
 * VirtualizedListCellRenderer Mock
 */

import React from 'react';

const VirtualizedListCellRenderer = jest.fn((props) => {
  return React.createElement('VirtualizedListCellRenderer', props, props.children);
});

export default VirtualizedListCellRenderer;
