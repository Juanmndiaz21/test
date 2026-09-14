export async function verifyTurnstile(token) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        // Keys not configured yet — allow only outside production to avoid
        // weakening the challenge when it is expected to be enforced.
        return process.env.NODE_ENV !== 'production';
    }
    if (!token) return false;

    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: form,
    });

    const data = await response.json();
    return data?.success === true;
}