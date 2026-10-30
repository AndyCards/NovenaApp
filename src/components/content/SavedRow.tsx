import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaListRow } from './Row';

export const SavedRow = ({ novena, onPress, subtitle }: { novena: Novena; onPress: () => void; subtitle?: string }) => (
  <NovenaListRow novena={novena} onPress={onPress} subtitle={subtitle} trailing={<Icon name="chevronRight" />} />
);
