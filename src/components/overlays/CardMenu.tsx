// The "..." menu on a Library card: pause, start again, remove.
import { colors, radius } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { FloatingCard } from './FloatingCard';
import { MenuOption } from './MenuOption';

type Props = { visible: boolean; paused?: boolean; onClose: () => void; onPause: () => void; onResume: () => void; onRestart: () => void; onRemove: () => void };

export function CardMenu({ visible, paused, onClose, onPause, onResume, onRestart, onRemove }: Props) {
  return (
    <FloatingCard visible={visible} onClose={onClose}>
      <MenuOption label={paused ? 'Resume novena' : strings.library.menuPause} onPress={paused ? onResume : onPause} />
      <MenuOption label={strings.library.menuRestart} onPress={onRestart} />
      <MenuOption label={strings.library.menuRemove} onPress={onRemove} />
    </FloatingCard>
  );
}
