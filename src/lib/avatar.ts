// Generate a cartoon-style avatar URL using DiceBear
export function getAvatarUrl(name: string, size = 80): string {
  // Use the "adventurer" style for a fun cartoonish look
  const seed = encodeURIComponent(name || 'unknown');
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&size=${size}`;
}
