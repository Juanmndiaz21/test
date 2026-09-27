export async function ensureCouponsTable(sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS coupons (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
            discount_value DECIMAL(10, 2) NOT NULL,
            min_order_amount DECIMAL(10, 2) DEFAULT 0,
            max_uses INTEGER DEFAULT NULL,
            used_count INTEGER DEFAULT 0,
            active BOOLEAN DEFAULT true,
            expires_at TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (UPPER(code))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (active)`;

    // Seed initial promotional coupons if table is empty
    const countResult = await sql`SELECT COUNT(*)::int as count FROM coupons`;
    if (countResult[0]?.count === 0) {
        await sql`
            INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, active)
            VALUES 
                ('ROWMODZ10', 'percentage', 10.00, 0, 500, true),
                ('BOOST20', 'percentage', 20.00, 35.00, 200, true),
                ('WELCOME5', 'fixed', 5.00, 15.00, 1000, true)
            ON CONFLICT (code) DO NOTHING
        `;
    }
}

export async function findCouponByCode(sql, rawCode) {
    if (!rawCode || typeof rawCode !== 'string') return null;
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) return null;

    const rows = await sql`
        SELECT * FROM coupons 
        WHERE UPPER(code) = ${cleanCode} 
        LIMIT 1
    `;
    return rows[0] || null;
}

export function evaluateCoupon(coupon, subtotal) {
    if (!coupon) {
        return { valid: false, error: 'El cupón no existe o no es válido.' };
    }

    if (!coupon.active) {
        return { valid: false, error: 'Este cupón se encuentra inactivo.' };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, error: 'Este cupón ha expirado.' };
    }

    if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.used_count >= coupon.max_uses) {
        return { valid: false, error: 'Este cupón ha alcanzado el límite máximo de usos.' };
    }

    const minAmount = Number(coupon.min_order_amount) || 0;
    if (subtotal < minAmount) {
        return {
            valid: false,
            error: `El pedido mínimo para aplicar este cupón es de $${minAmount.toFixed(2)}.`,
        };
    }

    let discount = 0;
    const discountValue = Number(coupon.discount_value);

    if (coupon.discount_type === 'percentage') {
        discount = (subtotal * discountValue) / 100;
    } else {
        discount = discountValue;
    }

    // El descuento no puede superar el total del pedido
    discount = Math.min(subtotal, Math.max(0, discount));
    const finalTotal = Math.max(0, subtotal - discount);

    return {
        valid: true,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue,
        discountAmount: Number(discount.toFixed(2)),
        finalTotal: Number(finalTotal.toFixed(2)),
        minOrderAmount: minAmount,
    };
}

export async function incrementCouponUsage(sql, code) {
    if (!code) return;
    const cleanCode = String(code).trim().toUpperCase();
    await sql`
        UPDATE coupons 
        SET used_count = used_count + 1 
        WHERE UPPER(code) = ${cleanCode}
    `;
}
