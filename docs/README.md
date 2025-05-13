# Stilya Documentation

Welcome to the Stilya documentation repository. This documentation is intended for developers, users, and stakeholders involved in the Stilya project.

## Overview

Stilya is a fashion recommendation app that uses swipe-based user interactions to learn user preferences and provide personalized product recommendations. The app is built with React Native (Expo) and TypeScript, backed by Supabase for authentication, database, and storage.

## Documentation Structure

This documentation is organized as follows:

- [API Documentation](./API_DOCUMENTATION.md) - Details about the Stilya API endpoints and data structures
- [Code Documentation Guide](./CODE_DOCUMENTATION_GUIDE.md) - Guidelines for code documentation and best practices
- [User Manual (English)](./USER_MANUAL_EN.md) - End-user guide for using the Stilya app (English)
- [User Manual (Japanese)](./USER_MANUAL_JA.md) - End-user guide for using the Stilya app (Japanese)

## Project Structure

The Stilya codebase follows a feature-based organization:

```
src/
├── assets/          # Images, fonts, and static resources
├── components/      # Reusable UI components organized by feature
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

## Key Features

- **Swipe Interface**: Intuitive swipe-based product evaluation (Yes/No)
- **Personalized Recommendations**: AI-driven product recommendations based on user preferences
- **Tag-Based Matching**: Initial recommendation engine based on product tags
- **Offline Support**: Basic offline functionality with data caching
- **Multi-language Support**: Both English and Japanese user interfaces

## Development Setup

To set up the development environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Stilya.git
   cd Stilya
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase URL and Anon Key

4. Start the development server:
   ```bash
   yarn start
   ```

## Deployment

The app is deployed using Expo EAS:

1. Build the app:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

2. Submit to app stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## Contributing

When contributing to this project:

1. Follow the code documentation guidelines in [Code Documentation Guide](./CODE_DOCUMENTATION_GUIDE.md)
2. Write tests for new features and bug fixes
3. Ensure your code passes linting and type checking with `yarn lint` and `yarn typecheck`
4. Create a pull request with a clear description of the changes

## License

This project is proprietary and confidential. Unauthorized distribution is prohibited.

## Contact

For questions and support, contact:
- Development Team: dev@stilya.app
- Product Team: product@stilya.app
