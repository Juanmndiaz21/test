import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import { getAdminSession } from '../../../lib/guard';
import { ensureContactTable, CONTACT_STATUS_LABELS, CONTACT_STATUSES } from '../../../lib/contact';
import { updateMessageStatus, deleteMessage } from './actions';
import Icon from '../../../components/Icon';

export const dynamic = 'force-dynamic';

const STATUS_BADGE = {
    new: 'border-lime-300/40 bg-lime-300/10 text-lime-300',
    read: 'border-white/20 text-slate-300',
    replied: 'border-white/40 bg-white/10 text-white',
};

export default async function AdminContactPage() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    await ensureContactTable(sql);

    const messages = await sql`SELECT * FROM contact_messages ORDER BY id DESC`;

    const counts = {
        new: messages.filter((m) => m.status === 'new').length,
        read: messages.filter((m) => m.status === 'read').length,
        replied: messages.filter((m) => m.status === 'replied').length,
    };

    return (
        <div className="max-w-5xl">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">Contact messages</h1>

            <div className="flex flex-wrap gap-3 mb-6">
                <span className="text-xs uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    Total: {messages.length}
                </span>
                <span className="text-xs uppercase tracking-widest text-lime-300 bg-lime-300/10 border border-lime-300/20 px-3 py-1.5 rounded-lg">
                    New: {counts.new}
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    Read: {counts.read}
                </span>
                <span className="text-xs uppercase tracking-widest text-slate-200 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
                    Replied: {counts.replied}
                </span>
            </div>

            {messages.length === 0 ? (
                <div className="panel-surface rounded-2xl p-10 text-center text-slate-400">
                    No contact messages received yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className="panel-surface rounded-2xl p-6 transition-colors hover:border-lime-300/20">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-bold text-white">{msg.name}</h2>
                                        <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE[msg.status] || STATUS_BADGE.read}`}>
                                            {CONTACT_STATUS_LABELS[msg.status] || msg.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-lime-300 mt-0.5">{msg.email}</p>
                                    {msg.subject && (
                                        <p className="text-sm font-semibold text-slate-300 mt-2">
                                            Subject: {msg.subject}
                                        </p>
                                    )}
                                </div>
                                <span suppressHydrationWarning className="text-xs text-slate-500">
                                    {new Date(msg.created_at).toLocaleString('en')}
                                </span>
                            </div>

                            <p className="text-slate-300 text-sm whitespace-pre-line leading-relaxed mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                {msg.message}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <form action={updateMessageStatus} className="flex items-center gap-2">
                                    <input type="hidden" name="id" value={msg.id} />
                                    <label htmlFor={`status-${msg.id}`} className="text-xs text-slate-400">Status:</label>
                                    <select
                                        id={`status-${msg.id}`}
                                        name="status"
                                        defaultValue={msg.status}
                                        className="bg-[#171229] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:border-lime-300 outline-none"
                                    >
                                        {CONTACT_STATUSES.map((st) => (
                                            <option key={st} value={st}>{CONTACT_STATUS_LABELS[st]}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="submit"
                                        className="bg-lime-300 hover:bg-white text-black font-black text-xs px-3 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Update
                                    </button>
                                </form>

                                <div className="flex items-center gap-3">
                                    <a
                                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Rowmodz inquiry')}`}
                                        className="inline-flex items-center gap-1.5 text-xs text-lime-300 hover:text-white font-bold transition-colors"
                                    >
                                        <Icon name="mail" className="w-3.5 h-3.5" />
                                        Reply by email
                                    </a>
                                    <form action={deleteMessage}>
                                        <input type="hidden" name="id" value={msg.id} />
                                        <button
                                            type="submit"
                                            className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

