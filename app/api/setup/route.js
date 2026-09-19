import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { ensureUsersTable } from '../../../lib/auth';
import { ensureOrdersTable } from '../../../lib/orders';
import { getAdminSession } from '../../../lib/guard';

export async function GET() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        // Bootstrap: allowed without a session only while no administrators exist.
        const table = await sql`SELECT to_regclass('public.users') AS t`;
        if (table[0]?.t) {
            const users = await sql`SELECT 1 FROM users LIMIT 1`;
            if (users.length > 0 && !(await getAdminSession())) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
            }
        }

        const { ensureAppSchema } = await import('../../../lib/schema');
        await ensureAppSchema(sql);

        return NextResponse.json({ message: "Tables created successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}