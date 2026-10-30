// Reminders: daily time, weekdays, extras, quiet hours.
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingRow } from '@/components/inputs/SettingRow';
import { Switch } from '@/components/inputs/Switch';
import { WeekdayToggle } from '@/components/inputs/WeekdayToggle';
import { ReminderNote } from '@/components/overlays/ReminderNote';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useReminders } from '@/hooks/useReminders';
import { formatTime12 } from '@/utils/dateUtils';

const R = strings.reminders;
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Reminders() {
  const { settings, permission, update } = useReminders();
  if (!settings) return null;
  const toggleDay = (i: number) => update({ weekdays: settings.weekdays ^ (1 << i) });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <ScrollView contentContainerStyle={{ padding: screenMargin, paddingBottom: 140, gap: 16 }}>
        <Text accessibilityRole="header" style={[type.headingH2, { color: colors.text.primary }]}>{R.title}</Text>
        {!permission && <ReminderNote text="Reminders are off. Turn on notifications in Settings to get a gentle nudge." />}
        <SettingRow title={R.daily} body={R.dailyBody}
          control={<Switch label={R.daily} value={settings.enabled} onValueChange={(enabled) => update({ enabled })} />} />
        <SettingRow title={R.time} body={formatTime12(settings.time)} />
        <Text style={[type.titleSmall, { color: colors.text.primary }]}>{R.repeatOn}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {DAYS.map((d, i) => <WeekdayToggle key={i} label={d} on={!!(settings.weekdays & (1 << i))} onPress={() => toggleDay(i)} />)}
        </View>
        <Text style={[type.titleSmall, { color: colors.text.primary }]}>{R.extras}</Text>
        <SettingRow title={R.missedNote} body={R.missedNoteBody}
          control={<Switch label={R.missedNote} value={settings.missedDayNote} onValueChange={(missedDayNote) => update({ missedDayNote })} />} />
        <SettingRow title={R.feastNovenas} body={R.feastNovenasBody}
          control={<Switch label={R.feastNovenas} value={settings.feastSuggestions} onValueChange={(feastSuggestions) => update({ feastSuggestions })} />} />
        <SettingRow title={R.quietHours} body={`${formatTime12(settings.quietStart)} – ${formatTime12(settings.quietEnd)}`} />
      </ScrollView>
    </SafeAreaView>
  );
}
