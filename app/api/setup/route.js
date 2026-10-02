import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { ensureUsersTable } from '../../../lib/auth';
import { ensureOrdersTable } from '../../../lib/orders';
import { getAdminSession } from '../../../lib/guard';

export async function GET(req) {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const setupSecret = process.env.SETUP_SECRET;
        const authHeader = req?.headers?.get('x-setup-secret') || req?.headers?.get('authorization')?.replace(/^Bearer\s+/i, '');
        const isAuthorizedSecret = setupSecret && authHeader && authHeader === setupSecret;

        // In production, strictly require either a matching SETUP_SECRET or an active administrator session
        if (process.env.NODE_ENV === 'production' && !isAuthorizedSecret) {
            const admin = await getAdminSession();
            if (!admin) {
                return NextResponse.json({ error: 'Unauthorized: admin session or valid setup secret required in production.' }, { status: 401 });
            }
        } else if (!isAuthorizedSecret) {
            // Bootstrap: allowed without a session only while no users exist
            const table = await sql`SELECT to_regclass('public.users') AS t`;
            if (table[0]?.t) {
                const users = await sql`SELECT 1 FROM users LIMIT 1`;
                if (users.length > 0 && !(await getAdminSession())) {
                    return NextResponse.json({ error: 'Unauthorized: admin session required.' }, { status: 401 });
                }
            }
        }

        const { ensureAppSchema } = await import('../../../lib/schema');
        await ensureAppSchema(sql);

        return NextResponse.json({ message: "Tables created successfully" }, { status: 200 });
    } catch (error) {
        console.error('Setup endpoint error:', error);
        return NextResponse.json({ error: 'Could not complete initial setup.' }, { status: 500 });
    }
}