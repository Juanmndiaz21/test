import { neon } from '@neondatabase/serverless';

let helpTableEnsured = false;

export async function ensureHelpTable(sql) {
	if (helpTableEnsured) return;
	await sql`
		CREATE TABLE IF NOT EXISTS help_entries (
			id SERIAL PRIMARY KEY,
			type VARCHAR(40) NOT NULL DEFAULT 'faq',
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			position INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
	await sql`CREATE INDEX IF NOT EXISTS idx_help_entries_position ON help_entries (position ASC, id ASC)`;
	helpTableEnsured = true;
}

export async function fetchHelpEntries() {
	const sql = neon(process.env.DATABASE_URL);
	await ensureHelpTable(sql);
	const rows = await sql`
		SELECT id, type, title, content, position
		FROM help_entries
		ORDER BY position ASC, id ASC
	`;
	return rows;
}