// Reader menu: listen or read only, save, download, share, view intention.
import type { DownloadStatus } from '@/utils/downloadStatus';
import { strings } from '@/copy/strings';
import { FloatingCard } from './FloatingCard';
import { MenuRow } from './MenuRow';
import { DayStepper } from '../reader/DayStepper';

type Props = {
  visible: boolean;
  day: number;
  mode: 'listen' | 'read';
  saved: boolean;
  download: DownloadStatus;
  sizeMb?: number;
  hasAudio: boolean;
  onClose: () => void;
  onChangeDay: (day: number) => void;
  onMode: (m: 'listen' | 'read') => void;
  onToggleSave: () => void;
  onDownload: () => void;
  onRemoveDownload: () => void;
  onShare: () => void;
  onViewIntention: () => void;
};

export function ReaderOptionsMenu(p: Props) {
  const r = strings.reader;
  const downloadDetail =
    p.download.kind === 'downloading' ? r.downloading(p.download.pct)
    : p.download.kind === 'done' ? r.removeDownload
    : p.sizeMb ? `Text and audio · ${p.sizeMb} MB` : undefined;
  return (
    <FloatingCard visible={p.visible} onClose={p.onClose} title={r.prayerMode}>
      <DayStepper day={p.day} total={9} onChange={p.onChangeDay} />
      {p.hasAudio ? <MenuRow label={r.listen} detail={p.mode === 'listen' ? '✓' : undefined} onPress={() => p.onMode('listen')} /> : null}
      <MenuRow label={r.readOnly} detail={p.mode === 'read' ? '✓' : undefined} onPress={() => p.onMode('read')} />
      <MenuRow label={p.saved ? r.saved : r.save} onPress={p.onToggleSave} />
      {p.hasAudio ? (
        <MenuRow
          label={p.download.kind === 'done' ? r.offlineReady : r.download}
          detail={downloadDetail}
          onPress={p.download.kind === 'done' ? p.onRemoveDownload : p.onDownload}
        />
      ) : null}
      <MenuRow label={r.share} onPress={p.onShare} />
      <MenuRow label="View intention" onPress={p.onViewIntention} />
    </FloatingCard>
  );
}
