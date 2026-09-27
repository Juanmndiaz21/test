export const DEFAULT_OPTIONS = [
    { amount: 25, label: '25M' },
    { amount: 50, label: '50M' },
    { amount: 100, label: '100M' },
    { amount: 150, label: '150M' },
    { amount: 200, label: '200M' },
    { amount: 500, label: '500M' },
    { amount: 1000, label: '1000M' },
];

export const DEFAULT_PACKAGES = [
    { id: 'pkg-10m', label: '10 Million Cash', amount: 10, price: 25.0, wasPrice: 35.0 },
    { id: 'pkg-15m', label: '15 Million Cash', amount: 15, price: 30.0, wasPrice: 42.0 },
    { id: 'pkg-20m', label: '20 Million Cash', amount: 20, price: 35.0, wasPrice: 49.0 },
    { id: 'pkg-25m', label: '25 Million Cash', amount: 25, price: 40.0, wasPrice: 56.0 },
    { id: 'pkg-30m', label: '30 Million Cash', amount: 30, price: 50.0, wasPrice: 70.0 },
    { id: 'pkg-40m', label: '40 Million Cash', amount: 40, price: 65.0, wasPrice: 90.0 },
    { id: 'pkg-50m', label: '50 Million Cash', amount: 50, price: 80.0, wasPrice: 110.0 },
    { id: 'pkg-75m', label: '75 Million Cash', amount: 75, price: 110.0, wasPrice: 150.0 },
    { id: 'pkg-100m', label: '100 Million Cash', amount: 100, price: 140.0, wasPrice: 195.0 },
    { id: 'pkg-150m', label: '150 Million Cash', amount: 150, price: 190.0, wasPrice: 260.0 },
    { id: 'pkg-200m', label: '200 Million Cash', amount: 200, price: 240.0, wasPrice: 330.0 },
    { id: 'pkg-250m', label: '250 Million Cash', amount: 250, price: 290.0, wasPrice: 400.0 },
    { id: 'pkg-300m', label: '300 Million Cash', amount: 300, price: 340.0, wasPrice: 470.0 },
    { id: 'pkg-400m', label: '400 Million Cash', amount: 400, price: 420.0, wasPrice: 580.0 },
    { id: 'pkg-500m', label: '500 Million Cash', amount: 500, price: 500.0, wasPrice: 690.0 },
    { id: 'pkg-750m', label: '750 Million Cash', amount: 750, price: 680.0, wasPrice: 940.0 },
    { id: 'pkg-1b', label: '1 Billion Cash', amount: 1000, price: 850.0, wasPrice: 1180.0 },
    { id: 'pkg-1.5b', label: '1.5 Billion Cash', amount: 1500, price: 1150.0, wasPrice: 1590.0 },
    { id: 'pkg-2b', label: '2 Billion Cash', amount: 2000, price: 1450.0, wasPrice: 2000.0 },
];

export const DEFAULT_ADDONS = [
    { id: 'bunker', label: '51/51 Bunker Research Unlocked', originalPrice: 60.0, discountedPrice: 54.0 },
    { id: 'skills', label: 'Max Skills', originalPrice: 60.0, discountedPrice: 54.0 },
    { id: 'rank120', label: 'Rank 120', originalPrice: 72.2, discountedPrice: 65.0 },
    { id: 'trophy_ps5', label: 'Unlock GTA 5 PS5 Platinum Trophy', originalPrice: 27.8, discountedPrice: 25.0, platformOnly: 'PlayStation', versionOnly: 'PS5' },
    { id: 'trophy_ps4', label: 'Unlock GTA 5 PS4 Platinum Trophy', originalPrice: 16.7, discountedPrice: 15.0, platformOnly: 'PlayStation', versionOnly: 'PS4' },
    { id: 'fast_run', label: 'Fast Run (Optional Addon)', originalPrice: 38.9, discountedPrice: 35.0 },
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