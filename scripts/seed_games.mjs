import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const catalogGames = [
    { name: 'GTA V', mode: 'both' },
    { name: 'ARC Raiders', mode: 'multiplayer' },
    { name: 'COD', mode: 'multiplayer' },
    { name: 'BO7', mode: 'both' },
    { name: 'BO2', mode: 'both' },
    { name: 'BO1', mode: 'both' },
    { name: 'MW4', mode: 'both' },
    { name: 'Fortnite', mode: 'multiplayer' },
    { name: 'Roblox', mode: 'multiplayer' },
    { name: 'Elden Ring', mode: 'both' },
    { name: 'Forza Horizon 6', mode: 'both' },
    { name: 'RDR2', mode: 'both' },
    { name: 'Borderlands 4', mode: 'both' },
    { name: 'FC 26', mode: 'both' },
    { name: 'Overwatch', mode: 'multiplayer' },
    { name: 'Apex Legends', mode: 'multiplayer' },
    { name: 'Bloodborne', mode: 'both' },
    { name: "Demon's Souls", mode: 'both' },
    { name: 'Dying Light The Beast', mode: 'both' },
    { name: 'Lords of the Fallen', mode: 'both' },
    { name: 'Subnautica 2', mode: 'both' },
    { name: 'Windrose', mode: 'multiplayer' },
    { name: '8 Pool', mode: 'multiplayer' },
    { name: 'Battlefield 6', mode: 'multiplayer' },
    { name: 'Brawl Stars', mode: 'multiplayer' },
    { name: 'Clash of Clans', mode: 'multiplayer' },
    { name: 'Clash Royale', mode: 'multiplayer' },
    { name: 'Dead by Daylight', mode: 'multiplayer' },
    { name: 'Diablo II Resurrected', mode: 'both' },
    { name: 'Diablo IV', mode: 'both' },
    { name: 'Fallout 76', mode: 'multiplayer' },
    { name: 'Forza Horizon 4', mode: 'both' },
    { name: 'Forza Horizon 5', mode: 'both' },
    { name: 'Helldivers 2', mode: 'multiplayer' },
    { name: 'League of Legends', mode: 'multiplayer' },
    { name: 'Marvel Rivals', mode: 'multiplayer' },
    { name: 'No Rest for the Wicked', mode: 'both' },
    { name: 'Pokémon GO', mode: 'multiplayer' },
    { name: 'PSN Avatars', mode: 'both' },
    { name: 'PSN Trophies', mode: 'both' },
    { name: 'Rainbow 6 Siege', mode: 'multiplayer' },
    { name: 'Rocket League', mode: 'multiplayer' },
    { name: 'Space Marine 2', mode: 'both' },
    { name: 'CS2', mode: 'multiplayer' },
];

async function seed() {
    console.log('Seeding games catalog...');
    for (const g of catalogGames) {
        await sql`
            INSERT INTO games (name, mode)
            VALUES (${g.name}, ${g.mode})
            ON CONFLICT (name) DO UPDATE SET mode = EXCLUDED.mode
        `;
    }
    const count = await sql`SELECT COUNT(*)::int AS count FROM games`;
    console.log(`Successfully seeded! Total games in database: ${count[0].count}`);
}

seed().catch((err) => {
    console.error('Failed to seed games:', err);
    process.exit(1);
});

