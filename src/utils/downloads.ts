// Save a novena's audio on the phone for offline listening.
import * as FileSystem from 'expo-file-system/legacy';
import { audioUrl } from '@/constants/config';
import { deleteDownload, saveDownload } from '@/data/queries';

const dirFor = (novenaId: string) => `${FileSystem.documentDirectory}audio/${novenaId}/`;
export const localAudioPath = (novenaId: string, day: number) => `${dirFor(novenaId)}day-${day}.m4a`;

export async function isDownloaded(novenaId: string, day: number) {
  return (await FileSystem.getInfoAsync(localAudioPath(novenaId, day))).exists;
}

export async function downloadNovenaAudio(
  novenaId: string,
  days: number[],
  contentVersion: number,
  onProgress?: (pct: number) => void,
) {
  await FileSystem.makeDirectoryAsync(dirFor(novenaId), { intermediates: true });
  await saveDownload({ novenaId, status: 'downloading', bytesDone: 0, bytesTotal: days.length, contentVersion });
  try {
    let done = 0;
    for (const day of days) {
      await FileSystem.downloadAsync(audioUrl(novenaId, day), localAudioPath(novenaId, day));
      done += 1;
      onProgress?.(Math.round((done / days.length) * 100));
      await saveDownload({ novenaId, status: 'downloading', bytesDone: done, bytesTotal: days.length, contentVersion });
    }
    await saveDownload({ novenaId, status: 'complete', bytesDone: days.length, bytesTotal: days.length, contentVersion });
  } catch (e) {
    await saveDownload({ novenaId, status: 'failed', bytesDone: 0, bytesTotal: days.length, contentVersion });
    throw e;
  }
}

export async function removeDownload(novenaId: string) {
  await FileSystem.deleteAsync(dirFor(novenaId), { idempotent: true });
  await deleteDownload(novenaId);
}
