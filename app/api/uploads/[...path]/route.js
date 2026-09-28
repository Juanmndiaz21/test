import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getUploadFromDb } from '@/lib/uploads';

const MIME_BY_EXT = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const rawPath = resolvedParams?.path;
        const filename = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '');

        if (!filename) {
            return new Response('Not Found', { status: 404 });
        }

        // 1. Try fetching from Neon database (stored as base64 in uploads table)
        if (process.env.DATABASE_URL) {
            try {
                const sql = neon(process.env.DATABASE_URL);
                const upload = await getUploadFromDb(sql, filename);
                if (upload && upload.data) {
                    const buffer = Buffer.from(upload.data, 'base64');
                    return new Response(buffer, {
                        status: 200,
                        headers: {
                            'Content-Type': upload.mime_type || 'image/jpeg',
                            'Cache-Control': 'public, max-age=31536000, immutable',
                            'Content-Length': String(buffer.length),
                        },
                    });
                }
            } catch (dbErr) {
                console.error('Error fetching image from database:', dbErr);
            }
        }

        // 2. Fallback: try reading from local public/uploads directory (if available on disk)
        try {
            const sanitizedFilename = path.basename(filename);
            const localPath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
            const buffer = await readFile(localPath);
            const ext = path.extname(sanitizedFilename).toLowerCase();
            const mimeType = MIME_BY_EXT[ext] || 'application/octet-stream';

            return new Response(buffer, {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
                    'Content-Length': String(buffer.length),
                },
            });
        } catch {
            // Not on disk
        }

        return new Response('Not Found', { status: 404 });
    } catch (err) {
        console.error('Upload serving error:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}
