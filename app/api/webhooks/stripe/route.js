import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { handleStripeWebhookEvent } from '@/lib/payments';

export async function POST(req) {
    try {
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
        }

        const rawBody = await req.text();
        const sql = neon(process.env.DATABASE_URL);

        const result = await handleStripeWebhookEvent({
            rawBody,
            signature,
            sql,
        });

        return NextResponse.json(result);
    } catch (err) {
        console.error('Stripe webhook error:', err.message);
        return NextResponse.json(
            { error: `Webhook handler failed: ${err.message}` },
            { status: 400 }
        );
    }
}
