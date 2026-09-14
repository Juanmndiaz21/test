import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { verifyTurnstile } from './turnstile';
import { rateLimit, clearRateLimit } from './rateLimit';

export async function ensureUsersTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'ADMIN'`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                turnstile: {}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const passedChallenge = await verifyTurnstile(credentials.turnstile);
                if (!passedChallenge) return null;

                const emailKey = String(credentials.email).toLowerCase();
                if (!(await rateLimit(`login:${emailKey}`, { limit: 10, windowMs: 15 * 60 * 1000 }))) return null;

                const sql = neon(process.env.DATABASE_URL);
                await ensureUsersTable(sql);

                const users = await sql`SELECT * FROM users WHERE LOWER(email) = ${emailKey}`;
                if (users.length === 0) return null;

                const user = users[0];
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                await clearRateLimit(`login:${emailKey}`);

                return { id: user.id, email: user.email, role: user.role || 'ADMIN' };
            }
        })
    ],
    session: { strategy: "jwt" },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === "production",
            }
        }
    }
};