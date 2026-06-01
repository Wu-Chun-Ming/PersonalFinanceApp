export const rankDescriptionSuggestions = (
  candidates: string[],
  query: string,
  limit = 5,
): string[] => {
  const q = (query || '').trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const filtered = candidates.filter((c) => {
    if (!c) return false;
    const lc = c.toLowerCase();
    return lc.includes(q) && lc !== q;
  });

  const prefix = filtered.filter((c) => c.toLowerCase().startsWith(q));
  const contains = filtered.filter((c) => !c.toLowerCase().startsWith(q));

  return [...prefix, ...contains].slice(0, limit);
};
