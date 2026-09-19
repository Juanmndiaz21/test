// NOTE: In-memory rate limiting.
// - Buckets live in a Map that is never evicted; a distinct key seen once keeps
//   its entry array until the process restarts, so memory grows with unique keys.
// - Counters reset on process restart; unsuitable for multi-instance deployments.
// - Evicts expired keys periodically to prevent memory leaks.
// - Counters reset on process restart; for multi-instance production use Redis/Upstash.
const buckets = new Map();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function sweepExpired(now) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entries] of buckets.entries()) {
        const valid = entries.filter((ts) => now - ts < 15 * 60 * 1000);
        if (valid.length === 0) {
            buckets.delete(key);
        } else {
            buckets.set(key, valid);
        }
    }
}

export async function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
    const now = Date.now();
    sweepExpired(now);

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