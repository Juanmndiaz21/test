import { DEFAULT_OPTIONS, normalizeOptions } from './serviceDefaults';

export { DEFAULT_OPTIONS };

let settingsTableEnsured = false;

export async function ensureSettingsTable(sql) {
    if (settingsTableEnsured) return;
    await sql`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    settingsTableEnsured = true;
}

export async function getServiceOptions(sql) {
    await ensureSettingsTable(sql);
    const rows = await sql`SELECT key, value FROM settings WHERE key IN ('options', 'boost_options', 'commends_options')`;
    const map = {};
    for (const row of rows) map[row.key] = row.value;

    const globalOptions =
        normalizeOptions(map.options) ||
        normalizeOptions(map.boost_options) ||
        normalizeOptions(map.commends_options) ||
        DEFAULT_OPTIONS;

    const boostOptions = normalizeOptions(map.boost_options) || globalOptions;
    const commendsOptions = normalizeOptions(map.commends_options) || globalOptions;

    return {
        options: globalOptions,
        boostOptions,
        commendsOptions,
    };
}

export async function saveServiceOptions(sql, { options, boostOptions, commendsOptions } = {}) {
    await ensureSettingsTable(sql);

    if (options) {
        const normalizedOptions = normalizeOptions(options);
        if (!normalizedOptions) throw new Error('Invalid options.');
        await sql`
            INSERT INTO settings (key, value, updated_at)
            VALUES ('options', ${JSON.stringify(normalizedOptions)}::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;
    }

    if (boostOptions) {
        const normalizedBoost = normalizeOptions(boostOptions);
        if (normalizedBoost) {
            await sql`
                INSERT INTO settings (key, value, updated_at)
                VALUES ('boost_options', ${JSON.stringify(normalizedBoost)}::jsonb, NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }
    }

    if (commendsOptions) {
        const normalizedCommends = normalizeOptions(commendsOptions);
        if (normalizedCommends) {
            await sql`
                INSERT INTO settings (key, value, updated_at)
                VALUES ('commends_options', ${JSON.stringify(normalizedCommends)}::jsonb, NOW())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            `;
        }
    }
}

export const DEFAULT_PAYMENT_METHODS = {
    stripe: true,
    paypal: true,
    crypto: true,
    crypto_discord: true,
    crypto_discord_title: 'Crypto / Binance Pay (Discord Ticket)',
    crypto_discord_instructions: 'Upon placing your order, your purchase code will be generated. Please open a ticket on our Discord server and share your code to receive payment details (Binance Pay / USDT) and activate your service instantly.',
    crypto_discord_url: 'https://discord.gg/qwyQjn4Aqx',
};

export async function getPaymentSettings(sql) {
    await ensureSettingsTable(sql);
    const rows = await sql`SELECT value FROM settings WHERE key = 'payment_methods' LIMIT 1`;
    if (!rows || rows.length === 0 || !rows[0].value) {
        return DEFAULT_PAYMENT_METHODS;
    }
    return {
        ...DEFAULT_PAYMENT_METHODS,
        ...rows[0].value,
    };
}

export async function savePaymentSettings(sql, settings) {
    await ensureSettingsTable(sql);
    const value = {
        stripe: Boolean(settings.stripe),
        paypal: Boolean(settings.paypal),
        crypto: Boolean(settings.crypto),
        crypto_discord: Boolean(settings.crypto_discord),
        crypto_discord_title: String(settings.crypto_discord_title || DEFAULT_PAYMENT_METHODS.crypto_discord_title).trim(),
        crypto_discord_instructions: String(settings.crypto_discord_instructions || DEFAULT_PAYMENT_METHODS.crypto_discord_instructions).trim(),
        crypto_discord_url: String(settings.crypto_discord_url || DEFAULT_PAYMENT_METHODS.crypto_discord_url).trim(),
    };
    await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES ('payment_methods', ${JSON.stringify(value)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    return value;
}