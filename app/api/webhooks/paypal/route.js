import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { handlePayPalWebhookEvent, verifyPayPalWebhookSignature } from '@/lib/paypal';

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const headers = req.headers;

        const authAlgo = headers.get('paypal-auth-algo');
        const certUrl = headers.get('paypal-cert-url');
        const transmissionId = headers.get('paypal-transmission-id');
        const transmissionSig = headers.get('paypal-transmission-sig');
        const transmissionTime = headers.get('paypal-transmission-time');
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;

        // If webhookId is configured, verify the signature with PayPal API
        if (webhookId) {
            const isValid = await verifyPayPalWebhookSignature({
                authAlgo,
                certUrl,
                transmissionId,
                transmissionSig,
                transmissionTime,
                webhookId,
                eventBody: rawBody,
            });

            if (!isValid) {
                console.warn('PayPal webhook signature verification failed.');
                return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
            }
        }

        let event;
        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL);
        const result = await handlePayPalWebhookEvent({ event, sql });

        return NextResponse.json(result);
    } catch (err) {
        console.error('PayPal webhook handler error:', err.message);
        return NextResponse.json(
            { error: `PayPal webhook handler failed: ${err.message}` },
            { status: 400 }
        );
    }
}
