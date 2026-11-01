// The small audio bar that stays on screen while a prayer is playing, whichever page you move to
// (Home, Library, Reminders, a novena's page, Search, Calendar). It sits just above the tab bar on the
// three tab pages, and just above the bottom edge everywhere else.
// It is not shown on the Reader (which has its own full player in the page) or on screens whose
// main button sits at the bottom ("Day marked as prayed", Share), so it never covers that button.
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AudioDock } from './AudioDock';

const TAB_PAGES = ['/', '/library', '/reminders'];
const HIDDEN_ON = ['/reader/', '/prayed/', '/share/'];
const TAB_BAR_HEIGHT = 69; // the tab icons and labels, above the phone's own bottom safe area

export function GlobalAudioDock() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  const onTabPage = TAB_PAGES.includes(path);
  const bottom = onTabPage ? Math.max(insets.bottom, 8) + TAB_BAR_HEIGHT + 8 : Math.max(insets.bottom, 10) + 4;
  return <AudioDock layout="compact" bottomOffset={bottom} />;
}
