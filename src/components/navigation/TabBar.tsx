// Glass bottom bar: Library · Discover · Reminders.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { AccessibilityInfo, View } from 'react-native';
import { useEffect, useState } from 'react';
import { blur, colors, stroke } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { TabItem } from './TabItem';
import type { IconName } from '../Icon';

const tabs: Record<string, { label: string; icon: IconName }> = {
  library: { label: strings.tabs.library, icon: 'book' },
  index: { label: strings.tabs.discover, icon: 'search' },
  reminders: { label: strings.tabs.reminders, icon: 'bell' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency); }, []);
  const content = (
    <View style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 24, borderTopWidth: stroke.hairline, borderColor: colors.glass.tabBarBorder }}>
      {state.routes.filter((r) => tabs[r.name]).map((route) => {
        const idx = state.routes.indexOf(route);
        const t = tabs[route.name];
        return <TabItem key={route.key} label={t.label} icon={t.icon} active={state.index === idx} onPress={() => navigateToTab(route.key)} />;
      })}
    </View>
  );
  if (reduceTransparency) return <View style={{ backgroundColor: colors.surface.raised }}>{content}</View>;
  return <BlurView intensity={blur.glass} tint="light" style={{ backgroundColor: colors.glass.tabBarFill }}>{content}</BlurView>;
}
