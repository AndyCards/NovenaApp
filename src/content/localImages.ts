// Pictures bundled inside the app, so the starter novenas show images offline.
// Any image not listed here is loaded from the content server.
import { imageUrl } from '@/constants/config';

/* eslint-disable @typescript-eslint/no-require-imports */
const bundled: Record<string, number> = {
  'saints/blcarlos.jpg': require('../../assets/images/saints/blcarlos.jpg'),
  'saints/divinemercy.jpg': require('../../assets/images/saints/divinemercy.jpg'),
  'saints/johnbosco.jpg': require('../../assets/images/saints/johnbosco.jpg'),
  'saints/maryundoerofknots.jpg': require('../../assets/images/saints/maryundoerofknots.jpg'),
  'saints/mtcarmel.jpg': require('../../assets/images/saints/mtcarmel.jpg'),
  'saints/perpetualsuccor.jpg': require('../../assets/images/saints/perpetualsuccor.jpg'),
  'saints/sacredheart.jpg': require('../../assets/images/saints/sacredheart.jpg'),
  'saints/stanthony.jpg': require('../../assets/images/saints/stanthony.jpg'),
  'saints/stcajetan.jpg': require('../../assets/images/saints/stcajetan.jpg'),
  'saints/stdymphna.jpg': require('../../assets/images/saints/stdymphna.jpg'),
  'saints/stjoanofarc.jpg': require('../../assets/images/saints/stjoanofarc.jpg'),
  'saints/stjoseph.jpg': require('../../assets/images/saints/stjoseph.jpg'),
  'saints/stjude.jpg': require('../../assets/images/saints/stjude.jpg'),
  'saints/stmonica.jpg': require('../../assets/images/saints/stmonica.jpg'),
  'saints/sttherese.jpg': require('../../assets/images/saints/sttherese.jpg'),
  'saints/surrendernovena.jpg': require('../../assets/images/saints/surrendernovena.jpg'),
};

export const imageSource = (file: string) => bundled[file] ?? { uri: imageUrl(file) };
