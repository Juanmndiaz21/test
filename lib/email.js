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

                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; text-align: center;">
                    If you have questions, reach out 24/7 through our support chat or contact page.<br>
                    © ${new Date().getFullYear()} OGMODZ. All rights reserved.
                </p>
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
            text: `Hello ${customerName},\n\nYour order has been placed. Your purchase tracking code is: ${orderCode}\n\nTrack your order here: ${trackingUrl}\n\nThank you for choosing OGMODZ!`,
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

                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; text-align: center;">
                    © ${new Date().getFullYear()} OGMODZ. All rights reserved.
                </p>
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
            text: `We received a request to reset your OGMODZ password.\n\nPlease visit the following link within 1 hour:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send password reset email:', err);
        return { success: false, error: err.message };
    }
}

function renderAdminItemsHtml(items = []) {
    return items
        .map((item) => {
            const rawDetails = item.details || {};
            const details = typeof rawDetails === 'string' ? JSON.parse(rawDetails || '{}') : rawDetails;
            const addons = Array.isArray(details.addons) ? details.addons : [];
            const platform = item.platform || 'All';
            const edition = details.edition || '';
            const pkg = details.package || '';

            return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 14px 10px; color: #f1f5f9; vertical-align: top;">
                    <div style="font-weight: 700; font-size: 15px; color: #ffffff;">${escapeHtml(item.name || 'Boosting Service')}</div>
                    <div style="margin-top: 4px; font-size: 12px; color: #94a3b8; font-family: monospace;">
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(157,124,255,0.15); color: #9d7cff; font-weight: 600; margin-right: 6px;">
                            ${escapeHtml(platform)}
                        </span>
                        ${edition ? `<span style="color: #cbd5e1; margin-right: 6px;">${escapeHtml(edition)}</span>` : ''}
                        ${pkg ? `<span style="color: #a78bfa;">${escapeHtml(pkg)}</span>` : ''}
                    </div>
                    ${addons.length > 0 ? `
                        <div style="margin-top: 8px; font-size: 11px;">
                            <span style="color: #9d7cff; font-weight: 700; text-transform: uppercase;">Addons (${addons.length}):</span>
                            <ul style="margin: 4px 0 0 16px; padding: 0; color: #cbd5e1;">
                                ${addons.map((a) => `<li style="margin-bottom: 2px;">${escapeHtml(a)}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </td>
                <td style="padding: 14px 10px; color: #94a3b8; text-align: center; vertical-align: top; font-weight: 600;">
                    ${Number(item.quantity) || 1}
                </td>
                <td style="padding: 14px 10px; color: #9d7cff; text-align: right; vertical-align: top; font-family: monospace; font-weight: 700; font-size: 15px;">
                    $${Number(item.unit_price || 0).toFixed(2)}
                </td>
            </tr>`;
        })
        .join('');
}

/**
 * Send new order alert notification to admin(s).
 */
export async function sendAdminOrderNotificationEmail({
    to,
    orderId,
    orderCode,
    customerName,
    customerEmail,
    total,
    paymentMethod = 'unknown',
    status = 'queued',
    items = [],
    adminUrl,
}) {
    const formattedTotal = Number(total || 0).toFixed(2);
    const safeCustomerName = escapeHtml(customerName) || 'Customer';
    const safeCustomerEmail = escapeHtml(customerEmail) || 'Unknown';
    const itemsHtml = renderAdminItemsHtml(items);
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert #${orderCode} - OGMODZ Admin</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <div style="max-width: 640px; margin: 32px auto; background-color: #140f24; border: 1px solid rgba(157, 124, 255, 0.35); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.7);">
            
            <!-- Top Header Banner -->
            <div style="background: linear-gradient(135deg, #2b184a 0%, #0d0914 100%); padding: 28px 32px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span style="font-size: 11px; font-weight: 800; color: #9d7cff; text-transform: uppercase; letter-spacing: 2px;">
                            CONTROL ROOM NOTIFICATION
                        </span>
                        <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">
                            🚨 New Boosting Order Received
                        </h1>
                    </div>
                </div>
            </div>

            <div style="padding: 32px;">
                <!-- Key Order Summary Card -->
                <div style="background-color: #0d0914; border: 1px solid rgba(157, 124, 255, 0.25); border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Order Code</td>
                            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 18px; font-weight: 900; color: #ffffff;">${orderCode}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Total Amount</td>
                            <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 22px; font-weight: 900; color: #9d7cff;">$${formattedTotal} <span style="font-size: 13px; color: #cbd5e1;">USD</span></td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Payment Method</td>
                            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #38bdf8; text-transform: uppercase; font-size: 12px;">${escapeHtml(paymentMethod)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Status</td>
                            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #4ade80; text-transform: uppercase; font-size: 12px;">${escapeHtml(status)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Customer Details Card -->
                <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #a78bfa; letter-spacing: 1.5px; margin-bottom: 12px;">
                        Customer Details
                    </div>
                    <div style="font-size: 14px; color: #e2e8f0; margin-bottom: 4px;">
                        <strong>Name:</strong> ${safeCustomerName}
                    </div>
                    <div style="font-size: 14px; color: #e2e8f0;">
                        <strong>Email:</strong> <a href="mailto:${safeCustomerEmail}" style="color: #9d7cff; text-decoration: none;">${safeCustomerEmail}</a>
                    </div>
                </div>

                <!-- Ordered Items -->
                <div style="margin-bottom: 28px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #a78bfa; letter-spacing: 1.5px; margin-bottom: 12px;">
                        Service Details
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left;">
                                <th style="padding: 8px 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px;">Service</th>
                                <th style="padding: 8px 10px; color: #94a3b8; font-weight: 600; text-align: center; text-transform: uppercase; font-size: 11px;">Qty</th>
                                <th style="padding: 8px 10px; color: #94a3b8; font-weight: 600; text-align: right; text-transform: uppercase; font-size: 11px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- CTA Button to Admin Panel -->
                ${adminUrl ? `
                <div style="text-align: center; margin: 36px 0 16px;">
                    <a href="${adminUrl}" style="background-color: #9d7cff; color: #0d0914; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 20px rgba(157,124,255,0.4);">
                        Open in Admin Panel →
                    </a>
                </div>
                ` : ''}

                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; text-align: center;">
                    This is an automated operational alert dispatched to store administrators.<br>
                    OGMODZ Control Room Engine · ${new Date().toUTCString()}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const transporter = getTransporter();
    if (!transporter) {
        console.log('\n================== [EMAIL SIMULATED: ADMIN ORDER ALERT] ==================');
        console.log(`To Admins: ${recipients}`);
        console.log(`Order Code: ${orderCode}`);
        console.log(`Customer: ${customerName} (${customerEmail})`);
        console.log(`Total: $${formattedTotal} USD via ${paymentMethod}`);
        console.log(`Admin URL: ${adminUrl}`);
        console.log('==========================================================================\n');
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: getFromAddress(),
            to: recipients,
            subject: `🚨 [NEW ORDER #${orderCode}] $${formattedTotal} - ${customerName} (${paymentMethod.toUpperCase()})`,
            text: `New order alert #${orderCode}\nCustomer: ${customerName} (${customerEmail})\nTotal: $${formattedTotal} USD\nPayment Method: ${paymentMethod}\nStatus: ${status}\n\nView in admin panel: ${adminUrl}`,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send admin order notification email:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Resolves the recipient list for admin order notifications.
 */
export async function getAdminNotificationRecipients(sql) {
    const recipients = new Set();

    // 1. Check environment variable (comma separated)
    const envAdmins = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    if (envAdmins) {
        envAdmins.split(',').forEach((em) => {
            const trimmed = em.trim();
            if (trimmed) recipients.add(trimmed);
        });
    }

    // 2. Fetch admins from database
    if (sql) {
        try {
            const rows = await sql`SELECT email FROM users WHERE role = 'ADMIN'`;
            for (const r of rows) {
                if (r?.email) {
                    recipients.add(r.email.trim());
                }
            }
        } catch (dbErr) {
            console.error('Failed to fetch admin recipients from DB:', dbErr);
        }
    }

    // 3. Fallback to default admin email
    if (recipients.size === 0) {
        recipients.add('juanmajuanma30@gmail.com');
    }

    return Array.from(recipients);
}

/**
 * High-level helper to notify store admins of an incoming order.
 */
export async function notifyAdminsOfNewOrder(sql, {
    orderId,
    orderCode,
    customerName,
    customerEmail,
    total,
    paymentMethod,
    status = 'queued',
    items = [],
    origin,
}) {
    try {
        const recipients = await getAdminNotificationRecipients(sql);
        if (recipients.length === 0) return { success: false, reason: 'No admin recipients found' };

        const baseUrl = origin || process.env.NEXTAUTH_URL || 'https://www.ogmodz.com';
        const adminUrl = `${baseUrl}/admin/orders`;

        return await sendAdminOrderNotificationEmail({
            to: recipients,
            orderId,
            orderCode,
            customerName,
            customerEmail,
            total,
            paymentMethod,
            status,
            items,
            adminUrl,
        });
    } catch (err) {
        console.error('Failed to dispatch new order notification to admins:', err);
        return { success: false, error: err.message };
    }
}

