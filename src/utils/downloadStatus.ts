// The possible states of an audio download: not downloaded, downloading (with a percentage), done, or failed.
export type DownloadStatus =
  | { kind: 'none' }
  | { kind: 'downloading'; pct: number }
  | { kind: 'done' }
  | { kind: 'failed' };
