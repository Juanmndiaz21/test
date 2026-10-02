import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_yM0nqXSGK9BE@ep-summer-field-aue7z0n3-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const sql = neon(DATABASE_URL);

const DESCRIPTIONS = {
    32: `Unlock all exclusive, awards, and stacked GTA V tattoos across your characters permanently. Delivered safely via private booster protocols without risking your account.

Service Details & Compatibility:
✓ Applied directly to your GTA Online character
✓ Works for PC Enhanced & Legacy Edition
✓ 100% Anti-Ban Guarantee & safe VPN connection
✓ Permanent unlock saved in all tattoo parlors
✓ Includes rare event-only and seasonal inked tattoos
✓ All Los Santos Customs & award-locked tattoos included

NOTE: Your character will retain all tattoos permanently even after game updates and wardrobe changes.`,

    37: `Fast Red Dead Online character leveling and XP boost for PC and PlayStation. Unlock high-tier weapons, ability cards, elite horses, and pamphlets without hundreds of hours of grinding.

Rank Boost Features & Safety:
✓ Safe XP boost to your target rank (Up to Rank 500+)
✓ All rank-locked ability cards & pamphlets unlocked
✓ 100% hand-played using private server sessions & encrypted VPN
✓ Fast delivery: 1 - 24 hours depending on rank gap
✓ Safe anti-ban recovery protocol

NOTE: Please ensure Two-Factor Authentication (2FA) is ready to authorize booster login upon order start.`,

    38: `Max out all 5 specialist roles in Red Dead Online. Unlock top-tier horses, role weapons, outfits, wagons, and camp upgrades instantly.

Role Levels Included:
✓ Bounty Hunter: Max Rank 30 (Prestigious Bounty Hunter included)
✓ Collector: Max Rank 20 (Metal detector & shovel unlocks)
✓ Trader: Max Rank 20 (Large delivery wagon unlock)
✓ Moonshiner: Max Rank 20 (Bar expansion & shine upgrades)
✓ Naturalist: Max Rank 20 (Wilderness camp fast travel)
✓ All role tokens, outfits, horses, and pamphlets unlocked

NOTE: Roles must be purchased in-game with gold bars, or order our Gold Bar package to unlock them simultaneously.`,

    42: `Dominate the Los Santos skies with rare modded aircraft. Features custom unselected paintjobs, Bennys wheels on landing gear, tinted cockpit glass, and glitched liveries.

Service Details & Compatibility:
✓ Applied directly to your Hangar inventory
✓ Works for PC Enhanced & Legacy Edition
✓ Fast delivery: 0 - 24 hours
✓ 100% Anti-Ban Guarantee with safe delivery protocol
✓ Saved permanently in your personal Hangar slots

Flickr Photo Catalogs:
✓ Pictures of Modded Planes & Helicopters: https://flic.kr/s/aHBqjBV7vR

NOTE: You must own a Hangar in GTA Online to store your modded planes and helicopters.`,

    43: `Ready-to-play GTA Online starter account with millions in clean cash, boosted rank, and essential unlocks. No need to purchase the base game separately.

Game Access & Compatibility:
✓ Full version of GTA 5 included (No base game purchase needed)
✓ Works for PC Enhanced & Legacy Edition
✓ Clean email and password with 100% full ownership transfer

Progression, Wealth & Unlocks:
✓ High Cash Balance ($50M - $100M+)
✓ Boosted Rank 120 (All weapons & armor unlocked)
✓ Max character stats & stamina
✓ Los Santos Customs (LSC) all car parts unlocked
✓ All heist awards & vehicle trade prices unlocked

NOTE: Account login credentials and original email access are delivered to your email immediately upon order completion.`,

    44: `The ultimate titan GTA Online modded account. Packed with massive wealth, maximum rank, 200 modded cars, 33 modded aircraft, and 40 rare modded outfits.

Game Access & Compatibility:
✓ Full version of GTA 5 included (Fresh license, lifetime ownership)
✓ Works for PC Enhanced & Legacy Edition
✓ 100% ban-free record with clean social club standing

Wealth, Rank & Assets:
✓ $500 Million to $1 Billion+ Cash Balance
✓ Selectable Rank up to Rank 1000
✓ 200 Modded Cars with Bennys wheels & secret liveries
✓ 33 Modded Aircraft in Hangar (Jets, Oppressors, Helicopters)
✓ 40 Modded Outfits (Male & Female with joggers and invisible limbs)
✓ 100% All weapon skins, clothing, and awards unlocked

NOTE: Full recovery credentials, email change guide, and security recommendations are delivered upon order completion.`
};

for (const [id, desc] of Object.entries(DESCRIPTIONS)) {
    console.log(`Updating product ${id}...`);
    await sql`
        UPDATE products
        SET description = ${desc}
        WHERE id = ${Number(id)}
    `;
    console.log(`✓ Product ${id} updated.`);
}

console.log('All remaining products synchronized successfully!');
