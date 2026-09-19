export async function verifyTurnstile(token) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        // If Turnstile secret is not set, allow operation (Turnstile is disabled)
        return true;
    }
    if (!token) return false;

    try {
        const form = new FormData();
        form.append('secret', secret);
        form.append('response', token);

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: form,
        });

        const data = await response.json();
        return data?.success === true;
    } catch (err) {
        console.error('Error verifying Turnstile:', err);
        return false;
    }
}