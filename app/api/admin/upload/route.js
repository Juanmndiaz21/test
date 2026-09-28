import { NextResponse } from 'next/server';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { requireAdmin } from '@/lib/guard';
import { saveUploadToDb, listUploadsFromDb } from '@/lib/uploads';

const ALLOWED_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/x-icon',
]);

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico']);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
    try {
        await requireAdmin();

        const fileMap = new Map();

        // 1. Fetch persistent uploads stored in Neon PostgreSQL database
        if (process.env.DATABASE_URL) {
            try {
                const sql = neon(process.env.DATABASE_URL);
                const dbUploads = await listUploadsFromDb(sql);
                for (const u of dbUploads) {
                    fileMap.set(u.filename, u);
                }
            } catch (dbErr) {
                console.error('Error listing uploads from DB:', dbErr);
            }
        }

        // 2. Also merge with any static uploads existing on local disk (if available)
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            const dirents = await readdir(uploadDir, { withFileTypes: true });

            await Promise.all(
                dirents
                    .filter((d) => d.isFile() && ALLOWED_EXTENSIONS.has(path.extname(d.name).toLowerCase()))
                    .map(async (d) => {
                        if (!fileMap.has(d.name)) {
                            try {
                                const filePath = path.join(uploadDir, d.name);
                                const fileStat = await stat(filePath);
                                fileMap.set(d.name, {
                                    filename: d.name,
                                    url: `/uploads/${d.name}`,
                                    size: fileStat.size,
                                    createdAt: fileStat.mtime.toISOString(),
                                });
                            } catch {
                                // Ignore stat failure
                            }
                        }
                    })
            );
        } catch {
            // Read-only filesystem or folder does not exist; safe to ignore
        }

        const files = Array.from(fileMap.values()).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return NextResponse.json({
            success: true,
            files,
        });
    } catch (err) {
        if (err.message?.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: err.message || 'Failed to list uploads' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await requireAdmin();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds maximum limit of 5 MB' }, { status: 400 });
        }

        const mimeType = (file.type || 'image/jpeg').toLowerCase();
        const originalName = file.name || 'image.png';
        const ext = path.extname(originalName).toLowerCase() || '.png';

        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json(
                { error: 'Invalid file extension. Allowed: PNG, JPEG, WebP, GIF, SVG, ICO' },
                { status: 400 }
            );
        }

        const baseName = path
            .basename(originalName, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);

        const uniqueFilename = `${Date.now()}-${baseName}${ext}`;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 1. Primary: Save to PostgreSQL database (survives serverless deploys & read-only fs)
        if (process.env.DATABASE_URL) {
            const sql = neon(process.env.DATABASE_URL);
            await saveUploadToDb(sql, {
                filename: uniqueFilename,
                mimeType: ALLOWED_MIME_TYPES.has(mimeType) ? mimeType : 'image/jpeg',
                buffer,
            });
        }

        // 2. Secondary: Best-effort local filesystem write (for local development)
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, uniqueFilename), buffer);
        } catch (diskErr) {
            // In serverless environments like Vercel, the filesystem is read-only (EROFS).
            // We safely catch this because the image is already persisted in the database.
            console.warn('Skipping local disk write (read-only filesystem):', diskErr.message);
        }

        const publicUrl = `/uploads/${uniqueFilename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: uniqueFilename,
        });
    } catch (err) {
        if (err.message?.includes('Unauthorized')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Image upload error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}
