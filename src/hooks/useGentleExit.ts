// A reusable "are you stepping away?" pattern. Today it powers "Take a pause?" on the Reader; the same hook can later
// power "Save your intention for later?" or "Pause listening?".
//
// What it does:
// - Counts how long the person has really been on the screen (only while the app is open) and how far they scrolled.
// - Once that passes the thresholds in PAUSE_PROMPT, leaving the screen (Back button, iOS swipe back, Android back)
//   is held for a moment and the gentle card is shown instead. Before that, Back simply leaves.
// - It never shows anything on its own: not after a timer, not when the app goes to the background, not from other menus.
// - It calls `onSave` silently whenever the app goes to the background, when the person leaves, and when the screen closes,
//   so nothing is lost and no extra question is asked.
import { usePreventRemove } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { PAUSE_PROMPT } from '@/constants/config';
import { shouldOfferPause, type PauseRules } from '@/utils/pauseRules';

type Options = {
  // False when there is nothing to pause: the day is already prayed, or it is a read-only preview.
  enabled: boolean;
  // Changing this starts counting again from zero (for example when the Reader moves to another day).
  resetKey?: string | number;
  rules?: PauseRules;
  // Save the in-progress state. Called quietly; it must not ask the person anything.
  onSave: () => void | Promise<void>;
};

export function useGentleExit({ enabled, resetKey, rules = PAUSE_PROMPT, onSave }: Options) {
  const [engaged, setEngaged] = useState(false); // true once leaving should ask first
  const [visible, setVisible] = useState(false); // is the card showing
  const [leaving, setLeaving] = useState(false); // true once the person chose to leave (or finished), so nothing is held
  const repeatLeave = useRef<(() => void) | null>(null); // continues the Back that was held
  const activeMs = useRef(0); // time on screen counted so far, not including the current open stretch
  const activeSince = useRef<number | null>(Date.now()); // when the current open stretch began (null while in background)
  const maxScroll = useRef(0);
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const seconds = () => (activeMs.current + (activeSince.current ? Date.now() - activeSince.current : 0)) / 1000;
  const check = useCallback(() => {
    if (shouldOfferPause({ activeSeconds: seconds(), maxScrollPx: maxScroll.current, done: !enabled }, rules)) setEngaged(true);
  }, [enabled, rules]);

  // Start counting from zero for a new day / new context.
  useEffect(() => {
    activeMs.current = 0;
    activeSince.current = AppState.currentState === 'active' ? Date.now() : null;
    maxScroll.current = 0;
    setEngaged(false);
    setVisible(false);
  }, [resetKey]);

  // Re-check at the two thresholds while the app is open. (This only arms the card; it never opens it.)
  useEffect(() => {
    if (!enabled || engaged) return;
    const timers = [rules.minSecondsWithScroll, rules.minEngagedSeconds].map((s) =>
      setTimeout(check, Math.max(0, s - seconds()) * 1000 + 50));
    return () => timers.forEach(clearTimeout);
  }, [enabled, engaged, check, resetKey, rules]); // eslint-disable-line react-hooks/exhaustive-deps

  // App goes to the background (switching apps, locking the phone): pause the clock and save silently. No card.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        if (activeSince.current === null) activeSince.current = Date.now();
        check();
      } else {
        if (activeSince.current !== null) { activeMs.current += Date.now() - activeSince.current; activeSince.current = null; }
        saveRef.current();
      }
    });
    return () => sub.remove();
  }, [check]);

  // Save once more when the screen closes, however that happened.
  useEffect(() => () => { saveRef.current(); }, []);

  // Hold Back / swipe back only while engaged. The held Back is kept so "Leave" can carry it on.
  const disablePrevention = usePreventRemove(enabled && engaged && !leaving, ({ repeat }) => {
    repeatLeave.current = repeat;
    setVisible(true);
  });

  // Scroll counts as engagement. Pass this to the ScrollView's onScroll.
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > maxScroll.current) { maxScroll.current = y; if (!engaged) check(); }
  }, [engaged, check]);

  // "Keep praying", the X, tapping outside, or Android back on the card: close it and stay exactly where they were.
  // The clock is not reset, so trying to leave again asks again.
  const stay = useCallback(() => { setVisible(false); repeatLeave.current = null; }, []);

  // "Leave and resume later": save, close the card, then carry on with the Back that was held.
  const leave = useCallback(async () => {
    setVisible(false);
    setLeaving(true);
    await saveRef.current();
    const go = repeatLeave.current;
    repeatLeave.current = null;
    go?.();
  }, []);

  // Call before leaving on purpose in another way (e.g. after "Mark as prayed"), so that move is never held.
  const allowLeave = useCallback(() => { setLeaving(true); disablePrevention(); }, [disablePrevention]);

  return { visible, engaged, onScroll, stay, leave, allowLeave };
}
