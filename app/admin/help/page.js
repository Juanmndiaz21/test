import { redirect } from 'next/navigation';
import { addHelpEntry, updateHelpEntry, deleteHelpEntry } from './actions';
import { getAdminSession } from '../../../lib/guard';
import { fetchHelpEntries } from '../../../lib/helpData';
import { HELP_TYPES } from '../../../lib/helpTypes';

export const dynamic = 'force-dynamic';

export default async function AdminHelp() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const entries = await fetchHelpEntries();

    return (
        <div className="max-w-5xl mx-auto px-5 py-10">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">Edit Help</h1>

            <form action={addHelpEntry} className="panel-surface p-6 rounded-2xl mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Type</label>
                    <select name="type" defaultValue="faq" className="w-full bg-[#171229] border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none">
                        {HELP_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                    </select>
                </div>
                <div className="w-full">
                    <label className="block text-sm text-slate-400 mb-2">Position</label>
                    <input name="position" type="number" min="0" defaultValue="0" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Title</label>
                    <input name="title" type="text" required placeholder="e.g. How does delivery work?" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <div className="w-full md:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Content</label>
                    <textarea name="content" rows="4" required placeholder="The answer shown to your customers..." className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-lime-300 outline-none" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-300 hover:bg-white text-black font-black py-3 px-6 rounded-lg transition-colors cursor-pointer md:col-span-2">
                    Add entry
                </button>
            </form>

            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="panel-surface rounded-2xl p-6 text-center text-slate-400">No help entries yet.</div>
                ) : (
                    entries.map((entry) => {
                        const typeLabel = HELP_TYPES.find((type) => type.id === entry.type)?.label || entry.type;
                        return (
                            <div key={entry.id} className="panel-surface rounded-2xl p-5">
                                <div className="flex justify-between items-start gap-4 mb-3">
                                    <div>
                                        <span className="text-xs text-slate-400">#{entry.id} · Position {entry.position}</span>
                                        <h2 className="font-bold text-white mt-1">{entry.title}</h2>
                                    </div>
                                    <span className="text-xs text-lime-300 border border-lime-300/20 rounded-full px-3 py-1 whitespace-nowrap">{typeLabel}</span>
                                </div>
                                <p className="text-slate-400 whitespace-pre-line mb-4">{entry.content}</p>
                                <details className="text-left mb-3">
                                    <summary className="text-lime-300 hover:text-white font-bold text-sm cursor-pointer">Edit entry</summary>
                                    <form action={updateHelpEntry} className="panel-surface mt-3 p-4 rounded-xl space-y-3">
                                        <input type="hidden" name="id" value={entry.id} />
                                        <select name="type" defaultValue={entry.type} className="w-full bg-[#171229] border border-white/10 rounded-lg p-2 text-white">
                                            {HELP_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                                        </select>
                                        <div className="w-full">
                                            <input name="position" type="number" min="0" defaultValue={entry.position} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                        </div>
                                        <input name="title" defaultValue={entry.title} required className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                        <textarea name="content" defaultValue={entry.content} required rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                                        <button type="submit" className="w-full bg-lime-300 text-black font-black py-2 rounded-lg">Save changes</button>
                                    </form>
                                </details>
                                <form action={async () => {
                                    'use server';
                                    await deleteHelpEntry(entry.id);
                                }}>
                                    <button type="submit" className="text-red-400 hover:text-red-300 font-bold text-sm cursor-pointer">Delete</button>
                                </form>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}