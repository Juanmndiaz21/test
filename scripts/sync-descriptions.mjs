import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_yM0nqXSGK9BE@ep-summer-field-aue7z0n3-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const sql = neon(DATABASE_URL);

const html = fs.readFileSync('product-descriptions-showcase.html', 'utf8');

// Mapping of textarea IDs to product IDs in the database
const ID_MAP = {
    'desc-gta-outfits': 39,
    'desc-gta-cars': 40,
    'desc-gta-cash': 30,
    'desc-gta-rank': 41,
    'desc-gta-unlock-all': 45,
    'desc-cs2-commends': 34,
    'desc-rdr2-cash': 35,
    'desc-rdr2-gold': 36,
    'desc-steam-comments': 47,
};

const textareaRegex = /<textarea id="([^"]+)"[^>]*>([\s\S]*?)<\/textarea>/g;
let match;
const extracted = {};

while ((match = textareaRegex.exec(html)) !== null) {
    const textareaId = match[1];
    const text = match[2].trim();
    extracted[textareaId] = text;
}

console.log('Extracted descriptions for:', Object.keys(extracted));

for (const [textareaId, text] of Object.entries(extracted)) {
    const productId = ID_MAP[textareaId];
    if (!productId) {
        console.warn('No DB product mapping for:', textareaId);
        continue;
    }

    console.log(`Updating product ID ${productId} (${textareaId})...`);
    await sql`
        UPDATE products
        SET description = ${text}
        WHERE id = ${productId}
    `;
    console.log(`✓ Product ID ${productId} updated successfully.`);
}

console.log('Done!');
