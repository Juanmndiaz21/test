import crypto from 'crypto';

export async function ensurePasswordResetTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(128) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets (LOWER(email))`;
}

export async function createPasswordResetToken(sql, email) {
    await ensurePasswordResetTable(sql);
    const token = crypto.randomBytes(32).toString('hex');
    const emailKey = String(email).trim().toLowerCase();
    
    // Invalidate any previous unused tokens for this email
    await sql`
        UPDATE password_resets 
        SET used = TRUE 
        WHERE LOWER(email) = ${emailKey} AND used = FALSE
    `;

    // 1 hour expiration
    await sql`
        INSERT INTO password_resets (email, token, expires_at, used)
        VALUES (${emailKey}, ${token}, NOW() + INTERVAL '1 hour', FALSE)
    `;

    return token;
}

export async function verifyPasswordResetToken(sql, token, email) {
    if (!token || !email) return false;
    await ensurePasswordResetTable(sql);

    const emailKey = String(email).trim().toLowerCase();
    const rows = await sql`
        SELECT id, expires_at, used 
        FROM password_resets 
        WHERE token = ${token} 
          AND LOWER(email) = ${emailKey}
          AND used = FALSE 
          AND expires_at > NOW()
        LIMIT 1
    `;

    return rows.length > 0;
}

export async function markTokenUsed(sql, token) {
    if (!token) return;
    await ensurePasswordResetTable(sql);
    await sql`
        UPDATE password_resets 
        SET used = TRUE 
        WHERE token = ${token}
    `;
}
