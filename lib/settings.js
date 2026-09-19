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