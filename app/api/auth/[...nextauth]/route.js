import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                const sql = neon(process.env.DATABASE_URL);
                const users = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;

                if (users.length === 0) return null;

                const user = users[0];
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) return null;

                return { id: user.id, email: user.email };
            }
        })
    ],
    session: { strategy: "jwt" },
    pages: { signIn: '/login' },
    secret: process.env.NEXTAUTH_SECRET,

    // AÑADE ESTO:
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
});

export { handler as GET, handler as POST };