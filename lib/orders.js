export async function ensureOrdersTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
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
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS booster VARCHAR(120)`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(80) NOT NULL DEFAULT 'demo'`;
}

export const ORDER_STATUSES = ['queued', 'in_progress', 'completed', 'delivered', 'cancelled'];

export const ORDER_STATUS_LABELS = {
    queued: 'Queued',
    in_progress: 'In progress',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};