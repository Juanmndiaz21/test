import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getAdminSession } from '../../../../lib/guard';
import { ensureOrdersTable } from '../../../../lib/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL);
    await ensureOrdersTable(sql);

    const queued = await sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'queued'`;
    const inProgress = await sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'in_progress'`;
    const recent = await sql`SELECT id, customer_name, customer_email, status, booster, total, created_at FROM orders ORDER BY id DESC LIMIT 8`;

    return NextResponse.json({
        queued: queued[0]?.total ?? 0,
        inProgress: inProgress[0]?.total ?? 0,
        recent: recent.map((order) => ({
            ...order,
            total: Number(order.total),
        })),
    });
}