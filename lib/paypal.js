import { ensureScheme } from './guard.js';
import { sendOrderConfirmationEmail, notifyAdminsOfNewOrder } from './email.js';

function getPayPalApiBase() {
    const mode = (process.env.PAYPAL_MODE || 'live').toLowerCase();
    return mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';
}

/**
 * Generate an OAuth2 access token using PayPal Client ID & Secret.
 */
export async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return null;
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const apiBase = getPayPalApiBase();

    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal OAuth error:', response.status, errorText);
        throw new Error('Could not authenticate with PayPal.');
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Creates a PayPal checkout order and returns the approval URL.
 */
export async function createPayPalOrder({ orderId, orderCode, total, origin }) {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
        return { isConfigured: false, approvalUrl: null };
    }

    const rawBaseUrl = origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const baseUrl = ensureScheme(rawBaseUrl) || 'https://www.ogmodz.com';
    const apiBase = getPayPalApiBase();

    const response = await fetch(`${apiBase}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: String(orderId),
                    custom_id: String(orderId),
                    description: `OGmodz Order #${orderId} (${orderCode})`,
                    amount: {
                        currency_code: 'USD',
                        value: Number(total).toFixed(2),
                    },
                },
            ],
            application_context: {
                brand_name: 'OGmodz',
                user_action: 'PAY_NOW',
                return_url: `${baseUrl}/checkout/success?order_id=${orderId}&order_code=${orderCode}&provider=paypal`,
                cancel_url: `${baseUrl}/checkout?canceled=true`,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal create order failed:', errorText);
        throw new Error('Failed to create PayPal order.');
    }

    const data = await response.json();
    const approveLink = data.links?.find((link) => link.rel === 'approve');

    return {
        isConfigured: true,
        paypalOrderId: data.id,
        approvalUrl: approveLink ? approveLink.href : null,
    };
}

/**
 * Captures an approved PayPal order.
 */
export async function capturePayPalOrder(paypalOrderId) {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
        throw new Error('PayPal credentials not configured');
    }

    const apiBase = getPayPalApiBase();
    const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal capture error:', errorText);
        throw new Error('Failed to capture PayPal payment');
    }

    const data = await response.json();
    return {
        status: data.status,
        captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.id,
        raw: data,
    };
}

/**
 * Processes incoming PayPal webhook events.
 */
export async function handlePayPalWebhookEvent({ event, sql }) {
    const eventType = event.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = event.resource;
        const orderId = Number(resource.custom_id || resource.supplementary_data?.related_ids?.order_id);

        if (orderId && Number.isInteger(orderId)) {
            const updated = await sql`
                UPDATE orders 
                SET status = 'in_progress', 
                    payment_id = ${resource.id},
                    payment_method = 'paypal'
                WHERE id = ${orderId} AND (status <> 'in_progress' OR status IS NULL)
                RETURNING *
            `;

            const order = updated[0];
            if (order && order.customer_email) {
                try {
                    const items = await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;
                    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.ogmodz.com';
                    const trackingUrl = `${baseUrl}/track?code=${order.order_code}`;

                    await sendOrderConfirmationEmail({
                        to: order.customer_email,
                        customerName: order.customer_name,
                        orderCode: order.order_code,
                        total: order.total,
                        items,
                        trackingUrl,
                    });

                    await notifyAdminsOfNewOrder(sql, {
                        orderId,
                        orderCode: order.order_code,
                        customerName: order.customer_name,
                        customerEmail: order.customer_email,
                        total: order.total,
                        paymentMethod: 'paypal',
                        status: 'in_progress',
                        items,
                        origin: baseUrl,
                    });
                } catch (emailErr) {
                    console.error('Failed to send confirmation / admin notification email on PayPal webhook:', emailErr);
                }
            }
        }
    }

    return { received: true, eventType };
}

/**
 * Validates PayPal webhook notification signatures against PayPal API.
 */
export async function verifyPayPalWebhookSignature({
    authAlgo,
    certUrl,
    transmissionId,
    transmissionSig,
    transmissionTime,
    webhookId,
    eventBody,
}) {
    if (!webhookId) {
        return true;
    }

    try {
        const accessToken = await getPayPalAccessToken();
        if (!accessToken) return false;

        const apiBase = getPayPalApiBase();
        const response = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_algo: authAlgo,
                cert_url: certUrl,
                transmission_id: transmissionId,
                transmission_sig: transmissionSig,
                transmission_time: transmissionTime,
                webhook_id: webhookId,
                webhook_event: typeof eventBody === 'string' ? JSON.parse(eventBody) : eventBody,
            }),
        });

        if (!response.ok) {
            console.error('PayPal webhook verification request failed with status:', response.status);
            return false;
        }

        const data = await response.json();
        return data.verification_status === 'SUCCESS';
    } catch (err) {
        console.error('Error verifying PayPal webhook signature:', err);
        return false;
    }
}

