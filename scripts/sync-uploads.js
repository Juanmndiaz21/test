const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync('.env.local', 'utf8');
const match = envFile.match(/DATABASE_URL=([^\r\n]+)/);
if (!match) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const sql = neon(match[1].trim());

async function sync() {
    console.log('Ensuring uploads table in Neon...');
    await sql.query(`
        CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            mime_type TEXT NOT NULL,
            data TEXT NOT NULL,
            size INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    const dir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(dir)) {
        console.log('No public/uploads directory found.');
        return;
    }

    const files = fs.readdirSync(dir);
    console.log(`Found ${files.length} existing images on disk.`);

    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (!fs.statSync(fullPath).isFile()) continue;

        const ext = path.extname(f).toLowerCase();
        let mime = 'image/jpeg';
        if (ext === '.png') mime = 'image/png';
        else if (ext === '.webp') mime = 'image/webp';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.svg') mime = 'image/svg+xml';

        const buffer = fs.readFileSync(fullPath);
        const base64 = buffer.toString('base64');

        await sql.query(
            `
            INSERT INTO uploads (filename, mime_type, data, size, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (filename) DO UPDATE SET
                mime_type = EXCLUDED.mime_type,
                data = EXCLUDED.data,
                size = EXCLUDED.size
            `,
            [f, mime, base64, buffer.length]
        );

        console.log(`✓ Synced: ${f} (${(buffer.length / 1024).toFixed(1)} KB)`);
    }

    console.log('Done! All disk images synced to Neon.');
}

sync().catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
});
