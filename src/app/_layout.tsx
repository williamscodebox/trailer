import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
     <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />    
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}
