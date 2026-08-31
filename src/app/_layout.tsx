import AppTabs from '@/components/app-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
     <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />    
      <AppTabs />
    </>
  );
}
