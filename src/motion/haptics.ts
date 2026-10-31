// Gentle touch feedback. Three patterns only, so the app always "feels" the same:
//   tap      a light tick for switching things (switches, tabs, segments, saving)
//   confirm  a soft nudge for starting something (Start novena)
//   success  one calm double-tap when a day is marked prayed
// Failures (for example on a device without a haptic engine) are ignored on purpose.
import * as Haptics from 'expo-haptics';

const safe = (job: () => Promise<void>) => { job().catch(() => {}); };

export const haptics = {
  tap: () => safe(() => Haptics.selectionAsync()),
  confirm: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
