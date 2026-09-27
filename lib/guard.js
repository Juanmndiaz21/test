import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

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

export function getTrustedOrigin(headerList) {
    if (process.env.APP_URL) {
        return process.env.APP_URL.replace(/\/+$/, '');
    }
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL.replace(/\/+$/, '');
    }
    const origin = headerList?.get ? headerList.get('origin') : null;
    if (origin) {
        try {
            const url = new URL(origin);
            const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            const isOgmodz = url.hostname === 'ogmodz.com' || url.hostname.endsWith('.ogmodz.com');
            const isVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && url.hostname === process.env.VERCEL_PROJECT_PRODUCTION_URL;
            if (isLocal || isOgmodz || isVercel) {
                return url.origin;
            }
        } catch {}
    }
    return 'https://www.ogmodz.com';
}