import { useEffect, useState } from 'react';

/** Simple online check: asks the content server for its tiny version file. */
export function useNetwork(probeUrl: string) {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    let cancelled = false;
    fetch(probeUrl, { method: 'HEAD' })
      .then(() => !cancelled && setOnline(true))
      .catch(() => !cancelled && setOnline(false));
    return () => { cancelled = true; };
  }, [probeUrl]);
  return online;
}
