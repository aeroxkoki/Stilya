# Stilya Code Documentation Guide

This document describes the code documentation standards and practices used in the Stilya project.

## Documentation Standards

### JSDoc Format

We use TypeScript with JSDoc comments for code documentation. All exported functions, classes, interfaces, and complex objects should be documented using the following format:

```typescript
/**
 * Brief description of what the function/class/interface does
 *
 * Detailed explanation if necessary
 *
 * @param {Type} paramName - Description of the parameter
 * @returns {ReturnType} Description of the return value
 * @throws {ErrorType} Description of when errors might be thrown
 * @example
 * // Example usage
 * const result = someFunction('example');
 */
```

### Component Documentation

React components should include:
- Description of the component's purpose
- Props documentation
- Usage examples (if non-trivial)

Example:

```typescript
/**
 * ProductCard - Displays a product with image, title, price and brand
 * 
 * Allows users to swipe left/right to indicate dislike/like
 * 
 * @param {Product} product - The product to display
 * @param {(id: string, result: 'yes' | 'no') => void} onSwipe - Callback for swipe action
 * @param {() => void} onCardPress - Callback for when the card is pressed
 * @param {ViewStyle} style - Optional additional styles
 * @returns {React.ReactElement} A swipeable product card component
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSwipe,
  onCardPress,
  style,
}) => {
  // Component implementation
};
```

### Hook Documentation

Custom hooks should be thoroughly documented, explaining:
- The hook's purpose
- What values it returns
- Side effects
- Dependencies

Example:

```typescript
/**
 * Custom hook to manage swipe actions and interactions with the Supabase backend
 * 
 * This hook handles recording swipe actions, loading products, and maintaining
 * the current product index for the swipe interface
 * 
 * @param {string} userId - The current user's ID
 * @returns {SwipeHookResult} Object containing swipe state and actions
 * 
 * @example
 * const { 
 *   products, 
 *   currentIndex, 
 *   handleSwipe, 
 *   isLoading 
 * } = useSwipe(user.id);
 */
export const useSwipe = (userId: string): SwipeHookResult => {
  // Hook implementation
};
```

### Service Documentation

Service files should include a module-level description and documentation for each exported function:

```typescript
/**
 * @module productService
 * 
 * Service for handling product-related API calls and data management
 * Includes caching mechanisms and offline support
 */

// Cache configuration
const CACHE_TIMEOUT = 60 * 60 * 1000; // 1 hour

/**
 * Fetches a list of products from the backend with pagination support
 * 
 * Uses caching to improve performance and provide offline capabilities
 * Automatically prefetches images for better UX
 * 
 * @param {number} limit - Maximum number of products to fetch (default: 20)
 * @param {number} offset - Number of items to skip (for pagination)
 * @param {boolean} forceRefresh - Whether to bypass the cache
 * @returns {Promise<{products: Product[], hasMore: boolean, totalFetched: number}>}
 * @throws {Error} When the API request fails
 */
export const fetchProducts = async (
  limit = 20, 
  offset = 0, 
  forceRefresh = false
): Promise<{
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
}> => {
  // Implementation
};
```

### Type and Interface Documentation

Document types and interfaces with descriptions for each property:

```typescript
/**
 * Represents a product in the system
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  
  /** Product title/name */
  title: string;
  
  /** Brand or manufacturer */
  brand: string;
  
  /** Price in local currency */
  price: number;
  
  /** URL to the product image */
  imageUrl: string;
  
  /** Optional detailed description */
  description?: string;
  
  /** Array of tags for categorization and recommendation */
  tags: string[];
  
  /** Product category (tops, bottoms, accessories, etc.) */
  category?: string;
  
  /** URL for affiliate marketing link */
  affiliateUrl: string;
  
  /** Data source identifier */
  source?: string;
  
  /** Creation timestamp */
  createdAt?: string;
}
```

## Best Practices

### Commenting Complex Logic

Add inline comments for complex or non-obvious logic:

```typescript
// Normalize tag scores based on user activity level 
// This prevents power users from having disproportionate weights
if (totalActions > 100) {
  const normalizationFactor = 100 / totalActions;
  Object.keys(tagScores).forEach(tag => {
    tagScores[tag] *= normalizationFactor;
  });
}
```

### TODOs and Performance Notes

Use TODO comments for future improvements and performance considerations:

```typescript
// TODO: Replace with proper image caching solution
// Currently using basic prefetching which may cause memory issues with large datasets

// PERFORMANCE: Consider optimizing with virtualized list for large collections
```

### Error Handling Documentation

Document error handling approaches:

```typescript
/**
 * Fetches user preferences from the API
 * 
 * @param {string} userId - User ID
 * @returns {Promise<UserPreference | null>} User preferences or null if not found
 * 
 * @throws Will not throw errors, returns null instead for graceful degradation
 */
export const getUserPreferences = async (userId: string): Promise<UserPreference | null> => {
  try {
    // Implementation
  } catch (error) {
    // Log error but don't propagate to avoid UI disruption
    console.error('Error fetching user preferences:', error);
    return null;
  }
};
```

## File Organization Documentation

### Directory Structure

Document the purpose of each directory to help new developers navigate the codebase:

```
src/
├── assets/          # Images, fonts, and static resources
├── components/      # Reusable UI components organized by feature
│   ├── auth/        # Authentication-related components
│   ├── common/      # Shared UI elements (buttons, cards, etc.)
│   ├── onboarding/  # Onboarding flow components
│   ├── product/     # Product display components
│   ├── recommend/   # Recommendation-related components
│   └── swipe/       # Swipe UI components
├── constants/       # App-wide constant values and configuration
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── mocks/           # Mock data for development and testing
├── navigation/      # Navigation configuration
├── screens/         # Screen components organized by feature
├── services/        # API services and data handling
├── store/           # State management (Zustand)
├── styles/          # Shared styles and theme definitions
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

### Import Order Conventions

Document the import order standard used in the project:

```typescript
// 1. React and React Native imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party library imports
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';

// 3. Project imports - absolute (path aliases)
import { Product } from '@/types';
import { fetchProducts } from '@/services/productService';

// 4. Project imports - relative
import { ProductCard } from './ProductCard';
import styles from './styles';
```

## Examples from the Codebase

Here are examples of well-documented pieces from our codebase:

### Example: Recommendation Service

```typescript
/**
 * Analyzes user preferences based on their interaction history
 * 
 * This function aggregates user's swipe history, view history, and click logs
 * to generate a weighted tag preference profile. This profile is used for
 * personalized product recommendations.
 * 
 * @param {string} userId - User identifier
 * @param {boolean} skipCache - Whether to bypass the cache (default: false)
 * @returns {Promise<UserPreference | null>} User preference profile or null if insufficient data
 */
export const analyzeUserPreferences = async (
  userId: string,
  skipCache: boolean = false
): Promise<UserPreference | null> => {
  // Implementation...
};
```

### Example: Navigation Type Definitions

```typescript
/**
 * Navigation type definitions for the app's navigation structure
 * These types ensure type safety when navigating between screens
 */

/**
 * Root stack navigator param list
 * Defines the top-level navigation structure
 */
export type RootStackParamList = {
  /** Authentication flow screens */
  Auth: undefined;
  
  /** Main app tabs after login */
  Main: undefined;
  
  /** Onboarding flow for new users */
  Onboarding: undefined;
};

/**
 * Authentication stack navigator param list
 * Screens related to user authentication
 */
export type AuthStackParamList = {
  /** Login screen */
  Login: undefined;
  
  /** Registration screen */
  Register: undefined;
  
  /** Password recovery screen */
  ForgotPassword: undefined;
};

// Additional navigation types...
```

## Testing Documentation

Document testing approaches and patterns:

```typescript
/**
 * Tests for the product recommendation algorithm
 * 
 * @group unit
 * @group recommendations
 */
describe('Recommendation Engine', () => {
  /**
   * Tests that recommendations are based on user's past preferences
   * - Creates mock swipe history
   * - Analyzes preferences
   * - Verifies recommendations match expected tags
   */
  it('should recommend products with tags similar to previously liked products', async () => {
    // Test implementation
  });
});
```

## Maintenance and Documentation Updates

When making changes to the codebase:

1. Update documentation to reflect the changes
2. Keep JSDoc comments in sync with function signatures
3. Add examples for new components or complex functions
4. Document architectural decisions that might not be obvious from the code
