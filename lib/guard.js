import { getServerSession } from 'next-auth';
import { authOptions } from './auth.js';

export async function getAdminSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    if (session.user.role !== 'ADMIN') return null;
    return session;
}

export async function requireAdmin() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Unauthorized: administrator access required.');
    }
    return session;
}

export function ensureScheme(urlStr) {
    if (!urlStr) return '';
    let clean = String(urlStr).replace(/^["']|["']$/g, '').trim().replace(/\/+$/, '');
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
        if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(clean)) {
            clean = `http://${clean}`;
        } else {
            clean = `https://${clean}`;
        }
    }
    return clean;
}

export function getTrustedOrigin(headerList) {
    const rawOrigin = headerList?.get ? headerList.get('origin') : null;
    if (rawOrigin) {
        try {
            const formatted = ensureScheme(rawOrigin);
            const url = new URL(formatted);
            const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            const isOgmodz = url.hostname === 'ogmodz.com' || url.hostname.endsWith('.ogmodz.com');
            const isVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && url.hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL;
            if (isLocal || isOgmodz || isVercel) {
                return url.origin;
            }
        } catch {}
    }

    const host = headerList?.get ? (headerList.get('x-forwarded-host') || headerList.get('host')) : null;
    if (host) {
        try {
            const proto = (headerList?.get ? headerList.get('x-forwarded-proto') : null) || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
            const formatted = ensureScheme(`${proto}://${host}`);
            const url = new URL(formatted);
            const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            const isOgmodz = url.hostname === 'ogmodz.com' || url.hostname.endsWith('.ogmodz.com');
            const isVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && url.hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL;
            if (isLocal || isOgmodz || isVercel) {
                return url.origin;
            }
        } catch {}
    }

    if (process.env.APP_URL) {
        return ensureScheme(process.env.APP_URL);
    }
    if (process.env.NEXTAUTH_URL) {
        return ensureScheme(process.env.NEXTAUTH_URL);
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return ensureScheme(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    }

    return 'https://www.ogmodz.com';
}