// Glass bottom bar: Library · Discover · Reminders (Figma "Tab Bar Detailed" 1227:56658, 93.5 tall with the 21 home-indicator area).
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBar } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { GlassSurface } from '../GlassSurface';
import { TabItem } from './TabItem';
import type { IconName } from '../Icon';

const tabs: Record<string, { label: string; icon: IconName }> = {
  library: { label: strings.tabs.library, icon: 'bookmarks' },
  index: { label: strings.tabs.discover, icon: 'books' },
  reminders: { label: strings.tabs.reminders, icon: 'bell' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 4, paddingBottom: tabBar.bottomSpace(insets.bottom) }}>
      {state.routes.filter((r) => tabs[r.name]).map((route) => {
        const idx = state.routes.indexOf(route);
        const t = tabs[route.name];
        return <TabItem key={route.key} label={t.label} icon={t.icon} active={state.index === idx} onPress={() => navigateToTab(route.key)} />;
      })}
    </View>
  );
  return <GlassSurface edge="bottom" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>{content}</GlassSurface>;
}
