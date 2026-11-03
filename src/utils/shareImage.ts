// Turns a card on screen into an image and opens the phone's share sheet.
// Intentions are never included.
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';

export async function shareCard(ref: RefObject<unknown>) {
  const uri = await captureRef(ref as never, { format: 'png', quality: 1 });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png' });
}
