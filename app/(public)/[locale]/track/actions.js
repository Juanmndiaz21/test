'use server';

import { neon } from '@neondatabase/serverless';
import { ensureOrdersTable, getOrderByCode, ORDER_STATUS_LABELS } from '@/lib/orders';
import { rateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

export async function trackOrderAction(code) {
    try {
        if (!code || typeof code !== 'string' || !code.trim()) {
            return { success: false, error: 'Please enter a purchase tracking code.' };
        }

        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || 'anon';
        const allowed = await rateLimit(`track:${ip}`, { limit: 20, windowMs: 60 * 1000 });
        if (!allowed) {
            return { success: false, error: 'Too many tracking attempts. Please wait a minute.' };
        }

        if (!process.env.DATABASE_URL) {
            return { success: false, error: 'Database is not configured.' };
        }

        const sql = neon(process.env.DATABASE_URL);
        await ensureOrdersTable(sql);

        const order = await getOrderByCode(sql, code);
        if (!order) {
            return { success: false, notFound: true };
        }

        if (order.status === 'pending_payment') {
            return { success: false, error: 'Este pedido aún tiene el pago pendiente de confirmación.' };
        }

        // Mask customer email for privacy: jo***@example.com
        const maskEmail = (email) => {
            if (!email || !email.includes('@')) return 'customer';
            const [local, domain] = email.split('@');
            return `${local.slice(0, 2)}***@${domain}`;
        };

        return {
            success: true,
            order: {
                id: order.id,
                orderCode: order.order_code || `OGM-ORD-${order.id}`,
                status: order.status,
                statusLabel: ORDER_STATUS_LABELS[order.status] || order.status,
                customerEmailMasked: maskEmail(order.customer_email),
                booster: order.booster || null,
                total: Number(order.total || 0).toFixed(2),
                createdAt: order.created_at,
                items: (order.items || []).map((it) => ({
                    id: it.id,
                    name: it.name,
                    quantity: it.quantity,
                    platform: it.platform,
                    boostAmount: it.boost_amount,
                    game: it.game,
                })),
            },
        };
    } catch (err) {
        console.error('Error in trackOrderAction:', err);
        return { success: false, error: err.message || 'Error tracking order.' };
    }
}

export async function getUserRecentOrdersAction() {
    try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/lib/auth');
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return { success: false, orders: [] };
        }

        if (!process.env.DATABASE_URL) {
            return { success: false, error: 'Database is not configured.', orders: [] };
        }

        const sql = neon(process.env.DATABASE_URL);
        const { getOrdersByEmail } = await import('@/lib/orders');
        const rawOrders = await getOrdersByEmail(sql, session.user.email, 5);

        const orders = (rawOrders || []).map((o) => ({
            id: o.id,
            orderCode: o.order_code || `OGM-ORD-${o.id}`,
            status: o.status || 'queued',
            statusLabel: ORDER_STATUS_LABELS[o.status] || o.status,
            total: Number(o.total || 0).toFixed(2),
            createdAt: o.created_at ? new Date(o.created_at).toISOString() : null,
        }));

        return { success: true, orders };
    } catch (err) {
        console.error('Error in getUserRecentOrdersAction:', err);
        return { success: false, error: err.message, orders: [] };
    }
}
