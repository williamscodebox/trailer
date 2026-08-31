import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  
 const colorScheme = useColorScheme() ?? 'light';


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].background,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}
