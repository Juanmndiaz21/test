'use server'
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function registerUser(email, password) {
    const sql = neon(process.env.DATABASE_URL);

    // Verificar si ya existe
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
        throw new Error('El correo ya está registrado');
    }

    // Encriptar contraseña y guardar
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (email, password) VALUES (${email}, ${hashedPassword})`;

    return { success: true };
}