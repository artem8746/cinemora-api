export function bytesToMegabytes(bytes: number): number {
  return bytes / 1024 / 1024;
}

export function formatFileSize(bytes: number): string {
  const mb = bytesToMegabytes(bytes);
  return `${mb.toFixed(2)}MB`;
}
