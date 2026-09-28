'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/guard';
import { savePaymentSettings } from '@/lib/settings';

export async function updatePaymentSettingsAction(prevState, formData) {
    try {
        await requireAdmin();

        const stripe = formData.get('stripe') === 'on';
        const paypal = formData.get('paypal') === 'on';
        const crypto = formData.get('crypto') === 'on';

        if (!stripe && !paypal && !crypto) {
            return {
                success: false,
                error: 'At least one payment method must remain active so customers can purchase.',
            };
        }

        const sql = neon(process.env.DATABASE_URL);
        const updated = await savePaymentSettings(sql, { stripe, paypal, crypto });

        revalidatePath('/admin/settings');
        revalidatePath('/checkout');
        revalidatePath('/en/checkout');
        revalidatePath('/es/checkout');

        return {
            success: true,
            settings: updated,
            message: 'Payment methods configuration updated successfully.',
        };
    } catch (err) {
        console.error('Failed to update payment settings:', err);
        return {
            success: false,
            error: err.message || 'Error updating payment settings.',
        };
    }
}
