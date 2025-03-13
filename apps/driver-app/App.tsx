import { AuthProvider } from './context/auth';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        {/* Your app navigation stack will go here */}
      </NavigationContainer>
    </AuthProvider>
  );
} 