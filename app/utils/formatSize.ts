/**
 * Formats a number of bytes into a human-readable string
 * @param bytes - The size in bytes
 * @returns A formatted string (e.g., "1.5 MB", "500 KB", "2 GB")
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Ensure we don't go beyond the available sizes
  const sizeIndex = Math.min(i, sizes.length - 1);
  const size = bytes / Math.pow(k, sizeIndex);

  // Format to 1 decimal place, but remove trailing zeros
  const formattedSize = parseFloat(size.toFixed(1));

  return `${formattedSize} ${sizes[sizeIndex]}`;
}

