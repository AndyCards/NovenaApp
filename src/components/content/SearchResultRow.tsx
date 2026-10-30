import type { Novena } from '@/content/types';
import { NovenaListRow } from './Row';

export const SearchResultRow = (p: { novena: Novena; onPress: () => void }) => <NovenaListRow {...p} />;
