'use server'
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { ensureUsersTable } from '../../lib/auth';
import { getAdminSession } from '../../lib/guard';
import { verifyTurnstile } from '../../lib/turnstile';
import { rateLimit } from '../../lib/rateLimit';

export async function registerUser(email, password, turnstile, setupToken) {
    if (!email || !password) throw new Error('Email and password are required.');
    if (String(password).length < 8) throw new Error('The password must be at least 8 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) throw new Error('A valid email is required.');

    const passedChallenge = await verifyTurnstile(turnstile);
    if (!passedChallenge) throw new Error('Security check failed. Try again.');

    const emailKey = String(email).toLowerCase();
    if (!(await rateLimit(`register:${emailKey}`, { limit: 5, windowMs: 15 * 60 * 1000 }))) {
        throw new Error('Too many attempts. Try again later.');
    }

    const sql = neon(process.env.DATABASE_URL);
    await ensureUsersTable(sql);

    const existing = await sql`SELECT * FROM users WHERE LOWER(email) = ${emailKey}`;
    if (existing.length > 0) throw new Error('This email is already registered.');

    const count = await sql`SELECT COUNT(*)::int AS total FROM users`;

    const hashedPassword = await bcrypt.hash(password, 10);
    let role = 'USER';
    if ((count[0]?.total ?? 0) === 0 && process.env.SETUP_TOKEN && setupToken === process.env.SETUP_TOKEN) {
        role = 'ADMIN';
    }
    await sql`INSERT INTO users (email, password, role) VALUES (${emailKey}, ${hashedPassword}, ${role})`;

    return { success: true, role };
}

export async function createAdmin(prevState, formData) {
    try {
        await getAdminSession();

        const email = String(formData.get('email') || '').trim().toLowerCase();
        const password = String(formData.get('password') || '');
        if (!email) throw new Error('The email is required.');
        if (password.length < 6) throw new Error('The password must be at least 6 characters.');

        const sql = neon(process.env.DATABASE_URL);
        await ensureUsersTable(sql);

        const existing = await sql`SELECT * FROM users WHERE LOWER(email) = ${email}`;
        if (existing.length > 0) throw new Error('This email is already registered.');

        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`INSERT INTO users (email, password, role) VALUES (${email}, ${hashedPassword}, 'ADMIN')`;

        return { success: `Admin created: ${email}`, error: null };
    } catch (error) {
        return { success: null, error: error.message || 'Could not create the administrator.' };
    }
}