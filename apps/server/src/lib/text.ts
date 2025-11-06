export function chunkText(text: string, chunkSizeChars = 1600, overlapChars = 200): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + chunkSizeChars, cleaned.length);
    let slice = cleaned.slice(start, end);
    // Try to cut at sentence boundary
    const lastPeriod = slice.lastIndexOf('. ');
    if (lastPeriod > chunkSizeChars * 0.6 && end < cleaned.length) {
      slice = slice.slice(0, lastPeriod + 1);
    }
    chunks.push(slice);
    start += chunkSizeChars - overlapChars;
  }
  return chunks;
}

