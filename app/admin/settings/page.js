import { neon } from '@neondatabase/serverless';
import { requireAdmin } from '@/lib/guard';
import { getPaymentSettings } from '@/lib/settings';
import PaymentSettingsForm from './PaymentSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    await requireAdmin();

    const sql = neon(process.env.DATABASE_URL);
    const settings = await getPaymentSettings(sql);

    return (
        <div className="max-w-4xl">
            <p className="eyebrow mb-2">Store Configuration</p>
            <h1 className="display-font text-4xl uppercase mb-3 text-white">Payment Methods</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Control which payment methods are visible and accepted on your store checkout. You can enable or hide any method at any time.
            </p>

            <div className="panel-surface rounded-2xl p-6 sm:p-8 border border-white/10">
                <PaymentSettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
