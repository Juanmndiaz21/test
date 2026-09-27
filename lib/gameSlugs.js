/**
 * Utility helpers to handle clean, SEO-friendly game slugs without %20 or uppercase letters.
 */

const GAME_SLUG_MAP = {
    'gta v': 'gta-5',
    'gta 5': 'gta-5',
    'gta-v': 'gta-5',
    'gta-5': 'gta-5',
    'cs2': 'cs2',
    'cs 2': 'cs2',
    'cs-2': 'cs2',
    'counter-strike 2': 'cs2',
    'rdr2': 'rdr2',
    'rdr 2': 'rdr2',
    'rdr-2': 'rdr2',
    'red dead redemption 2': 'rdr2',
};

const REVERSE_GAME_MAP = {
    'gta-5': 'GTA V',
    'gta-v': 'GTA V',
    'gta%20v': 'GTA V',
    'cs2': 'CS2',
    'rdr2': 'RDR2',
};

/**
 * Converts a raw database game name to a clean, lowercase, hyphenated URL slug.
 * @param {string} gameName 
 * @returns {string} Clean slug (e.g. 'gta-5', 'cs2', 'rdr2')
 */
export function gameToSlug(gameName = '') {
    if (!gameName) return '';
    const normalized = String(gameName).toLowerCase().trim();
    if (GAME_SLUG_MAP[normalized]) {
        return GAME_SLUG_MAP[normalized];
    }
    return normalized
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Resolves an incoming URL slug back to the standard DB game name.
 * Supports legacy encoded slugs like "GTA%20V" or "gta-5".
 * @param {string} slug 
 * @returns {string} Database game name (e.g. 'GTA V', 'CS2', 'RDR2')
 */
export function slugToGameName(slug = '') {
    if (!slug) return '';
    const decoded = decodeURIComponent(String(slug)).trim();
    const lower = decoded.toLowerCase();

    if (REVERSE_GAME_MAP[lower]) {
        return REVERSE_GAME_MAP[lower];
    }
    if (GAME_SLUG_MAP[lower]) {
        const canonicalSlug = GAME_SLUG_MAP[lower];
        if (REVERSE_GAME_MAP[canonicalSlug]) {
            return REVERSE_GAME_MAP[canonicalSlug];
        }
    }
    return decoded;
}
