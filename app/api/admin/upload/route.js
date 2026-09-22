import { NextResponse } from 'next/server';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '@/lib/guard';

const ALLOWED_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
    'image/gif',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
    try {
        await requireAdmin();

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const dirents = await readdir(uploadDir, { withFileTypes: true });
        const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

        const filesWithStats = await Promise.all(
            dirents
                .filter((d) => d.isFile() && imageExtensions.has(path.extname(d.name).toLowerCase()))
                .map(async (d) => {
                    const filePath = path.join(uploadDir, d.name);
                    const fileStat = await stat(filePath);
                    return {
                        filename: d.name,
                        url: `/uploads/${d.name}`,
                        size: fileStat.size,
                        createdAt: fileStat.mtime.toISOString(),
                    };
                })
        );

        filesWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({
            success: true,
            files: filesWithStats,
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

        const mimeType = file.type || '';
        if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PNG, JPEG, WebP, SVG, GIF' },
                { status: 400 }
            );
        }

        // Sanitize base name and preserve extension
        const originalName = file.name || 'image.png';
        const ext = path.extname(originalName).toLowerCase() || '.png';
        const baseName = path
            .basename(originalName, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);

        const uniqueFilename = `${Date.now()}-${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFilename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

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

