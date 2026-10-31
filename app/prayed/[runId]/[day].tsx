// Day prayed, Figma Page 34 (1227:58282): a strip of days around today, a short note,
// the reminder line and "Share today's prayer".
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/actions/Button';
import { Icon } from '@/components/Icon';
import { colors, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { getReminderSettings } from '@/data/queries';
import { useCatalog } from '@/hooks/useCatalog';
import { useLibrary } from '@/hooks/useLibrary';
import { addDaysTo, formatShortDate, formatTime12 } from '@/utils/dateUtils';
import { Reveal } from '@/motion/Reveal';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { duration, ease } from '@/motion/tokens';

function DayDot({ prayed, today, date }: { prayed: boolean; today: boolean; date: string }) {
  const size = 50;
  // Just-prayed day: the dark fill and praying hands arrive quietly (fade and a gentle settle), as the page appears.
  const arrive = useSharedValue(today && prayed ? 0 : 1);
  useEffect(() => { if (today && prayed) arrive.value = withDelay(350, withTiming(1, { duration: duration.sheetIn, easing: ease.sheet })); }, [today, prayed, arrive]);
  const fill = useAnimatedStyle(() => ({ opacity: arrive.value, transform: [{ scale: 0.88 + 0.12 * arrive.value }] }));
  const dot = (
    <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'transparent', borderWidth: prayed ? 0 : 1, borderStyle: 'dashed', borderColor: colors.border.default }}>
      {prayed ? <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: colors.action.primary }, fill]} /> : null}
      <Icon name="handsPraying" size={26} color={prayed ? colors.text.onAction : colors.border.default} />
    </View>
  );
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      {today ? <View style={{ padding: 2, borderRadius: 30, borderWidth: 1.5, borderColor: colors.action.primary }}>{dot}</View> : <View style={{ padding: 3.5 }}>{dot}</View>}
      <Text style={[prayed ? type.labelCaption : type.bodySmall, { color: prayed ? colors.text.primary : colors.text.tertiary }]}>{today ? strings.dayPrayed.today : date}</Text>
    </View>
  );
}

export default function DayPrayed() {
  const { runId, day } = useLocalSearchParams<{ runId: string; day: string }>();
  const router = useRouter();
  const { novenaById } = useCatalog();
  const lib = useLibrary();
  const [reminder, setReminder] = useState<string | null>(null);
  // Find out if daily reminders are on, to show "We will gently remind you tomorrow at …".
  useEffect(() => { getReminderSettings().then((s) => setReminder(s.enabled ? s.time : null)); }, []);
  const run = lib.runs.find((r) => r.id === runId);
  const novena = run ? novenaById(run.novenaId) : undefined;
  if (!run || !novena) return null;
  const dayNo = Number(day);
  const total = novena.days.length;
  // Five days centred on the one just prayed, kept inside 1..9.
  // Pick five days to show in the strip, keeping the one just prayed in the middle where possible.
  const first = Math.max(1, Math.min(dayNo - 2, total - 4));
  const strip = Array.from({ length: Math.min(5, total) }, (_, i) => first + i);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: screenMargin + 2, paddingVertical: 6 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.common.close} onPress={() => router.replace(`/novena/${novena.id}`)}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={22} />
        </Pressable>
      </View>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 70, paddingHorizontal: 24, gap: 28 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {strip.map((d, i) => (
            <Reveal key={d} index={i}><DayDot prayed={run.prayedDays.includes(d)} today={d === dayNo} date={formatShortDate(addDaysTo(run.startedOn, d - 1))} /></Reveal>
          ))}
        </View>
        <Reveal index={strip.length} style={{ alignItems: 'center', gap: 6 }}>
          <Text accessibilityRole="header" style={[type.titleCard, { color: colors.text.primary, textAlign: 'center' }]}>{strings.dayPrayed.title(dayNo)}</Text>
          <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center' }]}>{strings.dayPrayed.body}</Text>
        </Reveal>
      </View>
      <View style={{ paddingHorizontal: screenMargin, paddingBottom: 8, gap: 10 }}>
        {/* The reminder note (not shown after the last day), then the Share button. */}
        {dayNo < total ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.m, borderWidth: 0.6, borderColor: colors.border.default }}>
            <Icon name="bell" size={20} color={colors.text.secondary} />
            <Text style={[type.bodyMedium, { flex: 1, color: colors.text.secondary }]}>{reminder ? strings.dayPrayed.reminder(formatTime12(reminder)) : strings.dayPrayed.setReminder}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/reminders')} hitSlop={10}>
              <Text style={[type.labelSmall, { color: colors.text.primary }]}>{reminder ? strings.dayPrayed.change : strings.dayPrayed.set}</Text>
            </Pressable>
          </View>
        ) : null}
        <Button label={strings.dayPrayed.share} icon="handsPraying" onPress={() => router.push(`/share/${novena.id}`)} />
      </View>
    </SafeAreaView>
  );
}
