// The three tabs at the bottom: Library, Discover, Reminders.
import { Tabs } from 'expo-router';
import { TabBar } from '@/components/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }} initialRouteName="index">
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders' }} />
    </Tabs>
  );
}
