export type SummarySegment = { text: string; highlight: boolean };

export function parseSummary(raw: string): SummarySegment[] {
  const parts = raw.split(/\[\[(.+?)\]\]/g); // odd indices = highlighted
  const segments: SummarySegment[] = [];
  parts.forEach((text, i) => {
    const highlight = i % 2 === 1;
    if (text === '' && !highlight) return; // drop empty normal gaps
    segments.push({ text, highlight });
  });
  return segments;
}
