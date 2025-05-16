import { registerRootComponent } from 'expo';
import App from './App';
import './src/utils/metro-serializer-fix';

// Import serializer fix to ensure compatibility with export:embed
import './src/utils/metro-serializer-fix';

// Register the main component
registerRootComponent(App);
