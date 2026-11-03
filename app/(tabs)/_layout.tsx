// The three tabs at the bottom: Library, Discover, Reminders.
import { Tabs } from 'expo-router/js-tabs';
import { useReducedMotion } from 'react-native-reanimated';
import { TabBar } from '@/components/navigation/TabBar';

// Home (Discover) is the first tab, and the Back gesture returns there.
export const unstable_settings = { anchor: 'index' };

export default function TabsLayout() {
  // Switching tabs cross-fades (skipped when iOS Reduce Motion is on).
  const reduced = useReducedMotion();
  return (
    <Tabs backBehavior="initialRoute" tabBar={(p) => <TabBar {...p} />}
      screenOptions={{ headerShown: false, animation: reduced ? 'none' : 'fade', transitionSpec: { animation: 'timing', config: { duration: 200 } } }}>
      {/* The three tabs, left to right. Each name matches a file in this folder. */}
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders' }} />
    </Tabs>
  );
}
