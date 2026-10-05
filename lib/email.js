import nodemailer from 'nodemailer';

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: {
            user,
            pass,
        },
    });
}

function getFromAddress() {
    return process.env.EMAIL_FROM || 'OGMODZ <admin@ogmodz.com>';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Send order confirmation email with the unique purchase order code.
 */
export async function sendOrderConfirmationEmail({
    to,
    customerName,
    orderCode,
    total,
    items = [],
    trackingUrl,
}) {
    const formattedTotal = Number(total || 0).toFixed(2);
    const safeCustomerName = escapeHtml(customerName) || 'Champion';
    const itemListHtml = items
        .map(
            (item) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 12px 8px; color: #f1f5f9; font-weight: 600;">${escapeHtml(item.name || 'Service')}</td>
                <td style="padding: 12px 8px; color: #94a3b8; text-align: center;">${Number(item.quantity) || 1}</td>
                <td style="padding: 12px 8px; color: #9d7cff; text-align: right; font-family: monospace;">$${Number(item.unit_price || 0).toFixed(2)}</td>
            </tr>`
        )
        .join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - OGMODZ</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0d0914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #161024; border: 1px solid rgba(157, 124, 255, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
            <div style="background: linear-gradient(135deg, #24163d 0%, #0d0914 100%); padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px;">OGMODZ</h1>
                <p style="margin: 6px 0 0; color: #9d7cff; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Purchase Confirmation</p>
            </div>
            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #cbd5e1; margin-top: 0;">Hello <strong style="color: #ffffff;">${safeCustomerName}</strong>,</p>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Thank you for your order! Your boosting request has been queued in our dispatcher system. Use the purchase code below to track live status and communicate with support.</p>
                
                <div style="margin: 28px 0; background: #0d0914; border: 1px dashed #9d7cff; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 12px; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">Your Purchase Tracking Code</div>
                    <div style="font-size: 26px; font-family: monospace; font-weight: 900; color: #ffffff; letter-spacing: 2px;">${orderCode}</div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); text-align: left;">
                            <th style="padding: 8px; color: #94a3b8; font-weight: 500;">Item</th>
                            <th style="padding: 8px; color: #94a3b8; font-weight: 500; text-align: center;">Qty</th>
                            <th style="padding: 8px; color: #94a3b8; font-weight: 500; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemListHtml}
                        <tr>
                            <td colspan="2" style="padding: 16px 8px 8px; font-weight: 700; color: #ffffff; text-align: right;">Total Due:</td>
                            <td style="padding: 16px 8px 8px; font-weight: 900; color: #9d7cff; font-family: monospace; font-size: 18px; text-align: right;">$${formattedTotal}</td>
                        </tr>
                    </tbody>
                </table>

                ${trackingUrl ? `
                <div style="text-align: center; margin: 32px 0 16px;">
                    <a href="${trackingUrl}" style="background-color: #9d7cff; color: #0d0914; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Track Order Status</a>
                </div>
                ` : ''}

                <div style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #cbd5e1; font-weight: 600;">OGmodz Marketplace · Verified Gaming Services</p>
                    <p style="margin: 0 0 8px;">
                        Need assistance? Reach our 24/7 support via <a href="https://www.ogmodz.com/contact" style="color: #9d7cff; text-decoration: underline;">Contact Form</a> or email <a href="mailto:support@ogmodz.com" style="color: #9d7cff; text-decoration: underline;">support@ogmodz.com</a>.
                    </p>
                    <p style="margin: 0 0 8px; font-size: 10px; color: #64748b;">
                        This is an essential transactional notification concerning your purchase. To manage notification preferences or request to unsubscribe from optional updates: <a href="https://www.ogmodz.com/contact?subject=Unsubscribe" style="color: #9d7cff; text-decoration: underline;">Unsubscribe / Manage Preferences</a>.<br>
                        Data Privacy &amp; Deletion Requests (GDPR / CCPA): <a href="https://www.ogmodz.com/privacy" style="color: #9d7cff; text-decoration: underline;">Privacy Policy</a>.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #64748b;">
                        © ${new Date().getFullYear()} OGmodz Marketplace. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const transporter = getTransporter();
    if (!transporter) {
        console.log('\n================== [EMAIL SIMULATED: ORDER CONFIRMATION] ==================');
        console.log(`To: ${to}`);
        console.log(`Customer: ${customerName}`);
        console.log(`Order Code: ${orderCode}`);
        console.log(`Total: $${formattedTotal}`);
        console.log(`Tracking URL: ${trackingUrl}`);
        console.log('===========================================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: getFromAddress(),
            to,
            subject: `Order Confirmation #${orderCode} - OGMODZ`,
            text: `Hello ${customerName},\n\nYour order has been placed. Your purchase tracking code is: ${orderCode}\n\nTrack your order here: ${trackingUrl}\n\nNeed support? Contact admin@ogmodz.com\n\nThis is a transactional email regarding your order. To manage notification preferences or unsubscribe from non-critical messages: https://www.ogmodz.com/contact?subject=Unsubscribe\n\n© ${new Date().getFullYear()} OGmodz Marketplace.`,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send order confirmation email:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Send password reset email with temporary recovery link.
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - OGMODZ</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0d0914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <div style="max-width: 560px; margin: 40px auto; background-color: #161024; border: 1px solid rgba(157, 124, 255, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
            <div style="background: linear-gradient(135deg, #24163d 0%, #0d0914 100%); padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: 2px;">OGMODZ</h1>
                <p style="margin: 6px 0 0; color: #9d7cff; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Security Terminal</p>
            </div>
            <div style="padding: 32px;">
                <h2 style="font-size: 20px; color: #ffffff; margin-top: 0; font-weight: 700;">Password Reset Request</h2>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">We received a request to reset your password for your OGMODZ account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
                
                <div style="text-align: center; margin: 36px 0;">
                    <a href="${resetUrl}" style="background-color: #9d7cff; color: #0d0914; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Reset Password</a>
                </div>

                <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

                <p style="font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px;">
                    Or paste this URL in your browser: <br>
                    <a href="${resetUrl}" style="color: #9d7cff; text-decoration: underline;">${resetUrl}</a>
                </p>

                <div style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #cbd5e1; font-weight: 600;">OGmodz Marketplace · Security &amp; Account Protection</p>
                    <p style="margin: 0 0 8px;">
                        Need assistance? Reach our 24/7 support at <a href="mailto:support@ogmodz.com" style="color: #9d7cff; text-decoration: underline;">support@ogmodz.com</a>.
                    </p>
                    <p style="margin: 0 0 8px; font-size: 10px; color: #64748b;">
                        This is an automated security notification regarding your OGmodz account. To manage notifications: <a href="https://www.ogmodz.com/contact?subject=Unsubscribe" style="color: #9d7cff; text-decoration: underline;">Notification Preferences</a>.<br>
                        Privacy Policy &amp; Right to Erasure: <a href="https://www.ogmodz.com/privacy" style="color: #9d7cff; text-decoration: underline;">Privacy Policy</a>.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #64748b;">
                        © ${new Date().getFullYear()} OGmodz Marketplace. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const transporter = getTransporter();
    if (!transporter) {
        console.log('\n================== [EMAIL SIMULATED: PASSWORD RESET] ==================');
        console.log(`To: ${to}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('=======================================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: getFromAddress(),
            to,
            subject: 'Reset your OGMODZ password',
            text: `We received a request to reset your OGMODZ password.\n\nPlease visit the following link within 1 hour:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nSupport:admin@ogmodz.com\nManage email preferences: https://www.ogmodz.com/contact?subject=Unsubscribe\n© ${new Date().getFullYear()} OGmodz Marketplace.`,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send password reset email:', err);
        return { success: false, error: err.message };
    }
}
