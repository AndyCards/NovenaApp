// The small audio bar (Figma "Audio Dock") that stays on screen while a prayer is playing, whichever page
// you move to (Home, Library, Reminders, a novena's page, Search, Calendar). On the three tab pages it sits
// just above the tab bar; everywhere else it sits at the bottom, above the phone's home indicator.
// It is not shown on the Reader (which has its own full player in the page) or on screens whose
// main button sits at the bottom ("Day marked as prayed", Share), so it never covers that button.
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBar } from '@/constants/theme';
import { AudioDock } from './AudioDock';

const TAB_PAGES = ['/', '/library', '/reminders'];
const HIDDEN_ON = ['/reader/', '/prayed/', '/share/'];

export function GlobalAudioDock() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  if (TAB_PAGES.includes(path)) {
    return <AudioDock layout="compact" bottomOffset={tabBar.height(insets.bottom)} bottomSpace={4} />;
  }
  // Figma: player, 4 of space, then the home indicator area at the very bottom.
  return <AudioDock layout="compact" bottomOffset={0} bottomSpace={4 + Math.max(insets.bottom, 21)} />;
}
