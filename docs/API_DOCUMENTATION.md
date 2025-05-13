# Stilya API Documentation

## Overview

This document provides a comprehensive reference to the Stilya application's API endpoints, data structures, and interactions. The Stilya app uses Supabase as its backend service, which provides a REST API for all database operations.

## Base URL

All API requests are made to the Supabase instance at the URL specified in your environment variables (`SUPABASE_URL`).

## Authentication

### Endpoints

| Method | Endpoint                        | Description                                      |
|--------|--------------------------------|--------------------------------------------------|
| POST   | /auth/signup                   | User registration with email and password         |
| POST   | /auth/signin                   | User login with email and password                |
| POST   | /auth/reset-password           | Request a password reset link                     |
| POST   | /auth/update-password          | Update user password after reset                  |
| POST   | /auth/signout                  | Sign out the current user                         |

### Authentication Examples

#### Sign Up

```typescript
const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};
```

#### Sign In

```typescript
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};
```

## Database Tables

Stilya uses the following database tables:

### users

Stores user profiles and preferences.

| Column           | Type                  | Description                                |
|------------------|----------------------|--------------------------------------------|
| id               | uuid                 | Primary key (links to auth.users)           |
| email            | text                 | User's email address                        |
| created_at       | timestamp            | Account creation timestamp                  |
| gender           | text                 | User's gender preference                    |
| style_preference | text[]               | Array of preferred style tags               |
| age_group        | text                 | User's age group                            |

### products

Stores product information.

| Column          | Type                  | Description                                |
|-----------------|----------------------|--------------------------------------------|
| id              | uuid                 | Primary key                                 |
| title           | text                 | Product name                                |
| image_url       | text                 | URL to product image                        |
| brand           | text                 | Brand name                                  |
| price           | numeric              | Product price                               |
| tags            | text[]               | Array of style/category tags                |
| category        | text                 | Product category                            |
| affiliate_url   | text                 | Affiliate link to purchase                  |
| source          | text                 | Source of the product data                  |
| created_at      | timestamp            | Record creation timestamp                   |

### swipes

Records user swipe actions on products.

| Column          | Type                  | Description                                |
|-----------------|----------------------|--------------------------------------------|
| id              | uuid                 | Primary key                                 |
| user_id         | uuid                 | Foreign key to users                        |
| product_id      | uuid                 | Foreign key to products                     |
| result          | text                 | 'yes' or 'no'                               |
| created_at      | timestamp            | Swipe timestamp                             |

### favorites

Stores user's favorite products.

| Column          | Type                  | Description                                |
|-----------------|----------------------|--------------------------------------------|
| id              | uuid                 | Primary key                                 |
| user_id         | uuid                 | Foreign key to users                        |
| product_id      | uuid                 | Foreign key to products                     |
| created_at      | timestamp            | Favorite timestamp                          |

### click_logs

Records clicks on affiliate links.

| Column          | Type                  | Description                                |
|-----------------|----------------------|--------------------------------------------|
| id              | uuid                 | Primary key                                 |
| user_id         | uuid                 | Foreign key to users                        |
| product_id      | uuid                 | Foreign key to products                     |
| created_at      | timestamp            | Click timestamp                             |

## API Endpoints

### User Profile

| Method | Endpoint                   | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| GET    | /user/profile              | Get the current user's profile                |
| PUT    | /user/profile              | Update the current user's profile             |
| POST   | /user/profile              | Create a new user profile                     |

### Products

| Method | Endpoint                   | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| GET    | /products                  | Get a list of products                        |
| GET    | /products/:id              | Get a specific product by ID                  |

### Swipes

| Method | Endpoint                   | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| POST   | /swipes                    | Record a swipe action                         |
| GET    | /swipes                    | Get swipe history for the current user        |

### Recommendations

| Method | Endpoint                   | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| GET    | /recommendations           | Get personalized product recommendations      |
| GET    | /recommendations/category  | Get recommendations by category               |

### Click Tracking

| Method | Endpoint                   | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| POST   | /click                     | Record a click on an affiliate link           |

## Data Structures

### Product

```typescript
interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  description?: string;
  tags: string[];
  category?: string;
  affiliateUrl: string;
  source?: string;
  createdAt?: string;
}
```

### User

```typescript
interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
}
```

### SwipeResult

```typescript
interface SwipeResult {
  productId: string;
  result: 'yes' | 'no';
  userId: string;
}
```

### Favorite

```typescript
interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}
```

### ClickLog

```typescript
interface ClickLog {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: string;
}
```

### UserPreference

```typescript
interface UserPreference {
  userId: string;
  tagScores: Record<string, number>;
  topTags: string[];
  lastUpdated: string;
}
```

## Common API Patterns

### Pagination

For endpoints that return multiple items (like `/products`), pagination is supported with the following parameters:

- `limit`: Number of items to return (default: 20)
- `offset`: Offset from which to start returning items (default: 0)

Example:
```
GET /products?limit=10&offset=20
```

### Filtering by Tags

For product endpoints, filtering by tags is supported with the `tags` parameter:

Example:
```
GET /products?tags=casual,summer,beach
```

### Error Handling

All API responses follow a standard format:

For successful requests:
```json
{
  "data": [/* array of items or single item */],
  "error": null
}
```

For failed requests:
```json
{
  "data": null,
  "error": {
    "message": "Error message",
    "details": "Additional error details if available"
  }
}
```

## Authentication Flow

1. User signs up or signs in
2. JWT token is stored in Secure Storage (for sensitive auth data)
3. Other app data is stored in AsyncStorage
4. Token is included in the Authorization header for all subsequent requests

## Offline Support

The app provides basic offline functionality:
- Cached products data with TTL (Time-To-Live) of 60 minutes
- Swipe actions are queued when offline and synced when connection is restored
- Image prefetching for improved offline viewing experience

## Development and Testing

For testing purposes, the API provides mock data that can be enabled by setting `USE_MOCK = true` in the appropriate service files. This allows testing the app without an active connection to the Supabase backend.

## Rate Limiting

Supabase applies rate limiting to protect the API from abuse. Current limits:
- 1000 requests per minute per user
- 100 requests per minute for unauthenticated requests

## Security Considerations

- All sensitive data is stored in Secure Storage
- Authentication tokens are never stored in regular storage
- Row Level Security (RLS) policies ensure users can only access their own data
- API requests use HTTPS for secure communication
