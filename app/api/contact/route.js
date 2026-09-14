import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { ensureContactTable } from '../../../lib/contact';
import { rateLimit } from '../../../lib/rateLimit';

export async function POST(request) {
    try {
        const body = await request.json();

        const name = String(body.name || '').trim().slice(0, 120);
        const email = String(body.email || '').trim().toLowerCase().slice(0, 255);
        const subject = String(body.subject || '').trim().slice(0, 120) || null;
        const message = String(body.message || '').trim().slice(0, 4000);

        if (!name) {
            return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
        }
        if (message.length < 10) {
            return NextResponse.json({ error: 'The message must be at least 10 characters.' }, { status: 400 });
        }

        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');
        if (!(await rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60 * 1000 }))) {
            return NextResponse.json({ error: 'Too many messages. Try again later.' }, { status: 429 });
        }

        const sql = neon(process.env.DATABASE_URL);
        await ensureContactTable(sql);

        const inserted = await sql`
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (${name}, ${email}, ${subject}, ${message})
            RETURNING id
        `;

        return NextResponse.json({ success: true, id: Number(inserted[0]?.id) });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json({ error: 'Could not save the message.' }, { status: 500 });
    }
}