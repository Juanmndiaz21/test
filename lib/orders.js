export function generateOrderCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
        p1 += chars.charAt(Math.floor(Math.random() * chars.length));
        p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `OGM-${p1}-${p2}`;
}

export async function ensureOrdersTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            order_code VARCHAR(32) UNIQUE,
            customer_name VARCHAR(255) NOT NULL DEFAULT 'Demo customer',
            customer_email VARCHAR(255) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'queued',
            booster VARCHAR(120),
            total DECIMAL(10, 2) NOT NULL DEFAULT 0,
            payment_method VARCHAR(80) NOT NULL DEFAULT 'demo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
            platform VARCHAR(80),
            boost_amount INTEGER,
            game VARCHAR(120)
        )
    `;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(32)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS booster VARCHAR(120)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(80) NOT NULL DEFAULT 'demo'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255)`;
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS details JSONB`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)`;
    await sql`UPDATE orders SET order_code = CONCAT('OGM-LEG-', LPAD(id::text, 4, '0')) WHERE order_code IS NULL`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON orders (order_code)`;
}

export async function getOrderByCode(sql, codeOrId, { allowNumeric = false } = {}) {
    if (!codeOrId) return null;
    const clean = String(codeOrId).trim().toUpperCase();

    // Check if numeric ID (e.g. "#12" or "12")
    const numericMatch = clean.replace(/^#/, '');
    const isNumeric = /^\d+$/.test(numericMatch);

    let orders;
    if (clean.startsWith('OGM-') || !isNumeric) {
        orders = await sql`
            SELECT id, order_code, customer_name, customer_email, status, booster, total, payment_method, created_at
            FROM orders
            WHERE UPPER(order_code) = ${clean}
            LIMIT 1
        `;
    } else if (allowNumeric) {
        const id = parseInt(numericMatch, 10);
        orders = await sql`
            SELECT id, order_code, customer_name, customer_email, status, booster, total, payment_method, created_at
            FROM orders
            WHERE id = ${id}
            LIMIT 1
        `;
    } else {
        // Enforce secure unguessable order code lookup to prevent IDOR order enumeration
        return null;
    }

    if (!orders || orders.length === 0) return null;
    const order = orders[0];

    const items = await sql`
        SELECT id, name, quantity, unit_price, platform, boost_amount, game, details
        FROM order_items
        WHERE order_id = ${order.id}
    `;

    return {
        ...order,
        items: items || [],
    };
}

export async function getOrdersByEmail(sql, email, limit = 20) {
    if (!email) return [];
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail) return [];

    await ensureOrdersTable(sql);

    const orders = await sql`
        SELECT id, order_code, customer_name, customer_email, status, booster, total, payment_method, created_at
        FROM orders
        WHERE LOWER(customer_email) = ${cleanEmail}
          AND status != 'pending_payment'
        ORDER BY created_at DESC
        LIMIT ${limit}
    `;

    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map((o) => o.id);
    const items = await sql`
        SELECT id, order_id, name, quantity, unit_price, platform, boost_amount, game
        FROM order_items
        WHERE order_id = ANY(${orderIds})
    `;

    const itemsByOrder = {};
    for (const it of (items || [])) {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push(it);
    }

    return orders.map((o) => ({
        ...o,
        items: itemsByOrder[o.id] || [],
    }));
}

export const ORDER_STATUSES = ['queued', 'in_progress', 'completed', 'delivered', 'cancelled'];

export const ORDER_STATUS_LABELS = {
    queued: 'Queued',
    in_progress: 'In progress',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};
