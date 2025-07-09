export function getComponentIdFromPath(filePath: string): string {
  if (!filePath) return 'UnknownComponent';
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  const rawName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return rawName.charAt(0).toUpperCase() + rawName.slice(1); // Capitalize
}
