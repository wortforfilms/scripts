const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const since = now - windowMs;
  const current = (buckets.get(key) ?? []).filter((time) => time > since);
  if (current.length >= limit) return false;
  current.push(now);
  buckets.set(key, current);
  return true;
}
