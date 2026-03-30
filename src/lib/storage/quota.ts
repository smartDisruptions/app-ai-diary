const DEFAULT_THRESHOLD = 4 * 1024 * 1024; // 4 MB

export function getStorageUsage(): number {
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith('diary-')) {
      const value = window.localStorage.getItem(key) ?? '';
      // Each char is 2 bytes in JS strings (UTF-16), but localStorage
      // implementations typically count chars. We measure key + value length in bytes.
      total += key.length + value.length;
    }
  }
  return total;
}

export function isNearQuota(thresholdBytes: number = DEFAULT_THRESHOLD): boolean {
  return getStorageUsage() >= thresholdBytes;
}
