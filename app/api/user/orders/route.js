import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { getOrdersByEmail, ORDER_STATUS_LABELS } from '@/lib/orders';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, orders: [], message: 'Not authenticated' }, { status: 401 });
        }

        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ success: false, orders: [], error: 'Database not configured' }, { status: 500 });
        }

        const sql = neon(process.env.DATABASE_URL);
        const rawOrders = await getOrdersByEmail(sql, session.user.email, 50);

        const orders = (rawOrders || []).map((o) => ({
            id: o.id,
            orderCode: o.order_code || `OGM-ORD-${o.id}`,
            status: o.status || 'queued',
            statusLabel: ORDER_STATUS_LABELS[o.status] || o.status,
            total: Number(o.total || 0).toFixed(2),
            createdAt: o.created_at ? new Date(o.created_at).toISOString() : null,
            paymentMethod: o.payment_method || 'demo',
            booster: o.booster || null,
            items: (o.items || []).map((it) => ({
                id: it.id,
                name: it.name,
                quantity: it.quantity,
                unitPrice: Number(it.unit_price || 0).toFixed(2),
                platform: it.platform,
                boostAmount: it.boost_amount,
                game: it.game,
            })),
        }));

        return NextResponse.json({ success: true, orders });
    } catch (err) {
        console.error('Error in /api/user/orders:', err);
        return NextResponse.json({ success: false, error: err.message, orders: [] }, { status: 500 });
    }
}
