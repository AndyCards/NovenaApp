import { View } from 'react-native';
import { space } from '@/constants/theme';
import { Pill } from '../inputs/Pill';
import { DurationLabel } from './DurationLabel';

export function NovenaMetaRow({ minutes, tags }: { minutes: number; tags: string[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[8] }}>
      <DurationLabel minutes={minutes} />
      {tags.map((t) => <Pill key={t} label={t} size="small" />)}
    </View>
  );
}
