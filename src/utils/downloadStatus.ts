export type DownloadStatus =
  | { kind: 'none' }
  | { kind: 'downloading'; pct: number }
  | { kind: 'done' }
  | { kind: 'failed' };
