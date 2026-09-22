export const ALL_PLATFORMS = ['PlayStation', 'Xbox', 'PC'];

/**
 * Normalizes a platform string (from product.platform) into an array of recognized platforms.
 * Matches: 'PlayStation', 'Xbox', 'PC'.
 */
export function parseProductPlatforms(platformString) {
    if (!platformString) return ALL_PLATFORMS;
    const p = String(platformString).trim().toLowerCase();

    // If 'all' or explicit combo containing all three
    if (p === 'all' || p === 'all platforms' || p.includes('pc/playstation/xbox')) {
        return ALL_PLATFORMS;
    }

    const matched = [];
    if (p.includes('playstation') || p.includes('ps')) {
        matched.push('PlayStation');
    }
    if (p.includes('xbox')) {
        matched.push('Xbox');
    }
    if (p.includes('pc') || p.includes('windows')) {
        matched.push('PC');
    }

    return matched.length > 0 ? matched : ALL_PLATFORMS;
}

/**
 * Resolves available platforms for a product configurator based on BOTH:
 * 1) product.platform (selected in Add/Edit service, e.g. 'PC', 'Xbox', 'PlayStation', 'PlayStation/Xbox')
 * 2) versions catalog configured in configurator_data.versions (where admin can remove platforms)
 */
export function resolveConfiguratorPlatforms(productPlatform, versionsCatalog) {
    const allowedByProduct = parseProductPlatforms(productPlatform);

    // If versionsCatalog is provided as an object, respect the platforms configured in it
    if (versionsCatalog && typeof versionsCatalog === 'object') {
        const configuredKeys = Object.keys(versionsCatalog).filter(
            (k) => Array.isArray(versionsCatalog[k])
        );

        // If admin specifically configured platforms in versions, take the intersection
        if (configuredKeys.length > 0) {
            const filtered = allowedByProduct.filter((plat) => configuredKeys.includes(plat));
            if (filtered.length > 0) {
                return filtered;
            }
        }
    }

    return allowedByProduct;
}

