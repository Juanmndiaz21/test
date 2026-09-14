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