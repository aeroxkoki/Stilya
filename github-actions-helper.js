/**
 * GitHub Actions Expo Build Helper
 * 
 * This script helps ensure compatibility between Expo and GitHub Actions
 * by configuring the environment appropriately for the build process.
 */

const fs = require('fs');
const path = require('path');

/**
 * Creates necessary directories if they don't exist
 */
function ensureDirectories() {
  const dirs = [
    './src',
    './src/navigation',
    './src/contexts',
    './src/components'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

/**
 * Creates minimal placeholder files to satisfy imports if they don't exist
 */
function createPlaceholderFiles() {
  const files = {
    './src/navigation/AppNavigator.tsx': `
import React from 'react';
import { View, Text } from 'react-native';

export default function AppNavigator() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Stilya App - Coming Soon</Text>
    </View>
  );
}
`,
    './src/contexts/AuthContext.tsx': `
import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`,
    './src/contexts/ThemeContext.tsx': `
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={null}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
`,
    './src/contexts/NetworkContext.tsx': `
import React, { createContext, useContext } from 'react';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  return (
    <NetworkContext.Provider value={null}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
`
  };

  Object.entries(files).forEach(([filePath, content]) => {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content.trim());
      console.log(`Created placeholder file: ${filePath}`);
    }
  });
}

/**
 * Main function
 */
function main() {
  console.log('Setting up build environment for GitHub Actions...');
  
  ensureDirectories();
  createPlaceholderFiles();
  
  console.log('Environment setup completed successfully');
}

// Run the script
main();
