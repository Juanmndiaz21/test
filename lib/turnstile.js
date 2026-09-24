export async function verifyTurnstile(token, { expectedAction, clientIp } = {}) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        // If Turnstile secret is not configured, allow operation in local/dev
        return true;
    }

    if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
        return false;
    }

    const expectedHostnames = new Set(
        (process.env.TURNSTILE_HOSTNAMES ?? '')
            .split(',')
            .map((h) => h.trim())
            .filter(Boolean)
    );

    try {
        const body = new URLSearchParams({
            secret,
            response: token,
        });

        if (clientIp) {
            body.append('remoteip', clientIp);
        }

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            signal: AbortSignal.timeout(10_000),
            body,
        });

        if (!response.ok) {
            console.error(`Turnstile siteverify HTTP error: ${response.status}`);
            return false;
        }

        const data = await response.json();

        if (!data.success) {
            console.warn('Turnstile verification failed:', data['error-codes']);
            return false;
        }

        if (expectedAction && data.action && data.action !== expectedAction) {
            console.warn(`Turnstile action mismatch: expected "${expectedAction}", got "${data.action}"`);
            return false;
        }

        if (expectedHostnames.size > 0 && data.hostname && !expectedHostnames.has(data.hostname)) {
            console.warn(`Turnstile hostname mismatch: "${data.hostname}" not in allowed list`);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error verifying Turnstile:', err);
        return false;
    }
}