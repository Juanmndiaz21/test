export const DEFAULT_OPTIONS = [
    { amount: 25, label: '25M' },
    { amount: 50, label: '50M' },
    { amount: 100, label: '100M' },
    { amount: 150, label: '150M' },
    { amount: 200, label: '200M' },
    { amount: 500, label: '500M' },
    { amount: 1000, label: '1000M' },
];

export function normalizeOptions(raw) {
    if (!Array.isArray(raw)) return null;
    const seen = new Set();
    const options = [];
    for (const entry of raw) {
        const amount = Number(entry?.amount);
        const label = String(entry?.label || '').trim();
        if (!Number.isInteger(amount) || amount <= 0 || !label || seen.has(amount)) continue;
        seen.add(amount);
        const rawPrice = entry?.price;
        const price = (rawPrice !== undefined && rawPrice !== null && !isNaN(Number(rawPrice)))
            ? Number(rawPrice)
            : undefined;
        options.push({ amount, label, ...(price !== undefined ? { price } : {}) });
    }
    return options.length > 0 ? options : null;
}