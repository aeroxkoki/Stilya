/**
 * FlatList Mock
 */

import React from 'react';

const FlatList = jest.fn((props) => {
  return React.createElement('FlatList', props, props.children);
});

export default FlatList;
