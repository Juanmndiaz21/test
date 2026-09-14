// NOTE: In-memory rate limiting.
// - Buckets live in a Map that is never evicted; a distinct key seen once keeps
//   its entry array until the process restarts, so memory grows with unique keys.
// - Counters reset on process restart; unsuitable for multi-instance deployments.
const buckets = new Map();

export async function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
    const now = Date.now();
    const entries = (buckets.get(key) || []).filter((ts) => now - ts < windowMs);
    if (entries.length >= limit) {
        buckets.set(key, entries);
        return false;
    }
    entries.push(now);
    buckets.set(key, entries);
    return true;
}

export async function clearRateLimit(key) {
    buckets.delete(key);
}