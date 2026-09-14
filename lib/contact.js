export const CONTACT_STATUSES = ['new', 'read', 'replied'];

export const CONTACT_STATUS_LABELS = {
    new: 'New',
    read: 'Read',
    replied: 'Replied',
};

export async function ensureContactTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(120),
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
}