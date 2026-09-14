import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import { ensureUsersTable } from '../../../lib/auth';
import { getAdminSession } from '../../../lib/guard';
import CreateAdminForm from '../../../components/CreateAdminForm';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const sql = neon(process.env.DATABASE_URL);
    await ensureUsersTable(sql);

    const users = await sql`SELECT id, email, role, created_at FROM users ORDER BY id ASC`;

    return (
        <div className="max-w-4xl">
            <p className="eyebrow mb-3">Control room</p>
            <h1 className="display-font text-5xl uppercase mb-8 text-white">Users & roles</h1>

            <CreateAdminForm />

            <div className="mt-10 panel-surface rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-slate-400">No users yet.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="border-t border-white/10">
                                    <td className="p-4 text-slate-400">#{user.id}</td>
                                    <td className="p-4 font-medium text-white">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`inline-block border rounded-full px-3 py-1 data-readout text-[11px] uppercase tracking-widest ${user.role === 'ADMIN' ? 'border-lime-300/40 text-lime-300' : 'border-white/20 text-slate-300'}`}>
                                            {user.role || 'ADMIN'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">{new Date(user.created_at).toLocaleString('en')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}