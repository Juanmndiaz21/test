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

        // Security check: PAYPAL_WEBHOOK_ID is required to verify signatures
        if (!webhookId) {
            if (process.env.NODE_ENV === 'production') {
                console.error('PayPal webhook error: PAYPAL_WEBHOOK_ID is not configured in production.');
                return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 500 });
            }
            console.warn('PayPal webhook warning: PAYPAL_WEBHOOK_ID is unset. Skipping verification in non-production environment.');
        } else {
            if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
                console.warn('PayPal webhook error: Missing required signature headers.');
                return NextResponse.json({ error: 'Missing PayPal signature headers' }, { status: 400 });
            }

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
