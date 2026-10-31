// Glass bottom bar: Library · Discover · Reminders.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { AccessibilityInfo, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { blur, colors } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { TabItem } from './TabItem';
import type { IconName } from '../Icon';

const tabs: Record<string, { label: string; icon: IconName }> = {
  library: { label: strings.tabs.library, icon: 'bookmarks' },
  index: { label: strings.tabs.discover, icon: 'books' },
  reminders: { label: strings.tabs.reminders, icon: 'bell' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency); }, []);
  const content = (
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 8), borderTopWidth: 0.5, borderColor: colors.glass.tabBarBorder }}>
      {state.routes.filter((r) => tabs[r.name]).map((route) => {
        const idx = state.routes.indexOf(route);
        const t = tabs[route.name];
        return <TabItem key={route.key} label={t.label} icon={t.icon} active={state.index === idx} onPress={() => navigateToTab(route.key)} />;
      })}
    </View>
  );
  if (reduceTransparency) return <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface.raised }}>{content}</View>;
  return <BlurView intensity={blur.glass} tint="light" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.glass.tabBarFill, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: -4 } }}>{content}</BlurView>;
}
