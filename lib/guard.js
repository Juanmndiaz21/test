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