// Reminders, Figma Page 34 (1227:58916): daily prayer time card, then Extras.
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { SettingRow } from '@/components/inputs/SettingRow';
import { Switch } from '@/components/inputs/Switch';
import { WeekdayToggle } from '@/components/inputs/WeekdayToggle';
import { ReminderNote } from '@/components/overlays/ReminderNote';
import { ReminderSheet } from '@/components/overlays/ReminderSheet';
import { colors, radius, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useReminders } from '@/hooks/useReminders';
import { formatTime12 } from '@/utils/dateUtils';
import { inQuietHours } from '@/utils/reminderPlanner';

const R = strings.reminders;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const QUIET = { start: '22:00', end: '07:00' };

const Divider = () => <View style={{ height: stroke.hairline, backgroundColor: colors.border.default }} />;
const Card = ({ children }: { children: ReactNode }) => (
  <View style={{ marginHorizontal: screenMargin, paddingHorizontal: 14, paddingVertical: 2, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>{children}</View>
);
const Header = ({ title }: { title: string }) => (
  <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.secondary, paddingHorizontal: screenMargin, paddingVertical: 6 }]}>{title}</Text>
);

export default function Reminders() {
  const router = useRouter();
  const { settings, permission, update, toggleWeekday } = useReminders();
  const [picking, setPicking] = useState(false);
  if (!settings) return null;
  // Turning a weekday on or off. The days are stored as one number where each day is one "switch".
  const toggleDay = (i: number) => toggleWeekday(1 << i);
  // Quiet hours are "off" when start equals end (an empty window).
  const quietOn = settings.quietStart !== settings.quietEnd;
  // Warn when the chosen time falls inside quiet hours, because then the reminder can't ring.
  const timeIsQuiet = settings.enabled && quietOn && inQuietHours(settings.time, settings.quietStart, settings.quietEnd);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenMargin + 2 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.common.back} onPress={() => router.navigate('/')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={22} />
        </Pressable>
        <Text accessibilityRole="header" style={[type.titleMedium, { flex: 1, textAlign: 'center', color: colors.text.secondary }]}>{R.screenTitle}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 140, gap: 24 }}>
        {!permission && <View style={{ paddingHorizontal: screenMargin }}><ReminderNote text="Reminders are off. Turn on notifications in Settings to get a gentle nudge." /></View>}
        <View style={{ gap: 10 }}>
          {/* First card: the daily reminder switch, the time (tap to change), and which weekdays. */}
          <Header title={R.title} />
          <Card>
            <SettingRow icon="clock" title={R.daily} body={R.dailyBody}
              control={<Switch label={R.daily} value={settings.enabled} onValueChange={(enabled) => update({ enabled })} />} />
            <Divider />
            <Pressable accessibilityRole="button" accessibilityLabel={`${R.time}, ${formatTime12(settings.time)}`} onPress={() => setPicking(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
              <Text style={[type.titleSmall, { flex: 1, color: colors.text.secondary, lineHeight: 22 }]}>{R.time}</Text>
              <Text style={[type.labelSmall, { color: colors.text.secondary }]}>{formatTime12(settings.time)}</Text>
              <Icon name="chevronRight" size={18} color={colors.text.secondary} />
            </Pressable>
            {timeIsQuiet ? <Text style={[type.bodySmall, { color: colors.text.secondary, paddingBottom: 10 }]}>{R.quietWarning}</Text> : null}
            <Divider />
            <View style={{ gap: 8, paddingVertical: 12 }}>
              <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{R.repeatOn}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {DAYS.map((d, i) => <WeekdayToggle key={d} label={d} on={!!(settings.weekdays & (1 << i))} onPress={() => toggleDay(i)} />)}
              </View>
            </View>
          </Card>
        </View>
        <View style={{ gap: 10 }}>
          {/* Second card: a note after a missed day, feast-day suggestions, and quiet hours. */}
          <Header title={R.extras} />
          <Card>
            <SettingRow icon="sun" title={R.missedNote} body={R.missedNoteBody}
              control={<Switch label={R.missedNote} value={settings.missedDayNote} onValueChange={(missedDayNote) => update({ missedDayNote })} />} />
            <Divider />
            <SettingRow icon="calendarDate" title={R.feastNovenas} body={R.feastNovenasBody}
              control={<Switch label={R.feastNovenas} value={settings.feastSuggestions} onValueChange={(feastSuggestions) => update({ feastSuggestions })} />} />
            <Divider />
            <SettingRow icon="moon" title={R.quietHours} body={quietOn ? `${formatTime12(settings.quietStart)} to ${formatTime12(settings.quietEnd)}` : `${formatTime12(QUIET.start)} to ${formatTime12(QUIET.end)}`}
              control={<Switch label={R.quietHours} value={quietOn}
                onValueChange={(on) => update(on ? { quietStart: QUIET.start, quietEnd: QUIET.end } : { quietStart: '00:00', quietEnd: '00:00' })} />} />
          </Card>
        </View>
      </ScrollView>
      {picking ? <ReminderSheet visible time={settings.time} onClose={() => setPicking(false)} onSave={(time) => { update({ time, enabled: true }); setPicking(false); }} /> : null}
    </SafeAreaView>
  );
}
