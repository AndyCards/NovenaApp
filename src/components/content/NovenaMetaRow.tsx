// Figma "Novena Meta Row": duration label, then the novena's tags as pills.
import { View } from 'react-native';
import { Pill } from '../inputs/Pill';
import { DurationLabel } from './DurationLabel';

export function NovenaMetaRow({ minutes, tags }: { minutes: number; tags: string[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      <DurationLabel minutes={minutes} />
      {tags.map((t) => <Pill key={t} label={t} />)}
    </View>
  );
}
