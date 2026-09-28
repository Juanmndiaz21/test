import { neon } from '@neondatabase/serverless';

let tableEnsured = false;

export async function ensureUploadsTable(sql) {
    if (tableEnsured) return;
    await sql`
        CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            mime_type TEXT NOT NULL,
            data TEXT NOT NULL,
            size INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    tableEnsured = true;
}

export async function saveUploadToDb(sql, { filename, mimeType, buffer }) {
    await ensureUploadsTable(sql);
    const base64Data = buffer.toString('base64');
    const size = buffer.length;

    await sql`
        INSERT INTO uploads (filename, mime_type, data, size, created_at)
        VALUES (${filename}, ${mimeType}, ${base64Data}, ${size}, NOW())
        ON CONFLICT (filename) DO UPDATE SET
            mime_type = EXCLUDED.mime_type,
            data = EXCLUDED.data,
            size = EXCLUDED.size,
            created_at = EXCLUDED.created_at
    `;

    return {
        filename,
        mimeType,
        size,
        url: `/uploads/${filename}`,
    };
}

export async function getUploadFromDb(sql, filename) {
    await ensureUploadsTable(sql);
    const rows = await sql`
        SELECT filename, mime_type, data, size, created_at
        FROM uploads
        WHERE filename = ${filename}
        LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    return rows[0];
}

export async function listUploadsFromDb(sql) {
    await ensureUploadsTable(sql);
    const rows = await sql`
        SELECT filename, mime_type, size, created_at
        FROM uploads
        ORDER BY created_at DESC
        LIMIT 200
    `;
    return rows.map((r) => ({
        filename: r.filename,
        url: `/uploads/${r.filename}`,
        size: r.size,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));
}
