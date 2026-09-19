'use server'
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import { normalizeOptions } from '../../../lib/serviceDefaults';

function parseProductOptions(formData, prefix = 'options') {
    const options = [];
    const basePrice = Number(formData.get('price'));
    for (let index = 0; formData.get(`${prefix}_amount_${index}`) !== null; index += 1) {
        const rawAmount = formData.get(`${prefix}_amount_${index}`);
        const rawLabel = formData.get(`${prefix}_label_${index}`);
        const rawPrice = formData.get(`${prefix}_price_${index}`);

        const parsedPrice = (rawPrice !== null && rawPrice !== '' && !isNaN(Number(rawPrice)))
            ? Number(rawPrice)
            : (Number.isFinite(basePrice) && basePrice > 0 ? basePrice : undefined);

        options.push({
            amount: rawAmount,
            label: rawLabel,
            ...(parsedPrice !== undefined ? { price: parsedPrice } : {}),
        });
    }
    return options.length > 0 ? normalizeOptions(options) || [] : [];
}

export async function addProduct(formData) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS platform VARCHAR(80)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_amount INTEGER`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS game VARCHAR(120)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS commends_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB`;
    await sql`UPDATE products SET options = COALESCE(boost_options, commends_options) WHERE options IS NULL AND boost_options IS NOT NULL`;
    await sql`UPDATE products SET options = COALESCE(boost_options, commends_options) WHERE options IS NULL AND commends_options IS NOT NULL`;
    const name = String(formData.get('name') || '').trim();
    const game = String(formData.get('game') || '').trim();
    if (!name) throw new Error('Product name is required.');
    if (!game) throw new Error('Game is required.');

    const price = Number(formData.get('price'));
    if (!Number.isFinite(price) || price <= 0) {
        throw new Error('Price must be a positive number.');
    }

    const rawBoostAmount = formData.get('boost_amount');
    const boostAmount = rawBoostAmount === null || rawBoostAmount === '' ? null : Number(rawBoostAmount);
    if (boostAmount !== null && (!Number.isInteger(boostAmount) || boostAmount <= 0)) {
        throw new Error('Boost amount must be a positive integer.');
    }

    const description = formData.get('description');
    const platform = formData.get('platform');
    const imageUrl = formData.get('image_url');
    const howItWorks = formData.get('how_it_works');
    const requirements = formData.get('requirements');
    const faqs = formData.get('faqs');
    const options = parseProductOptions(formData, 'options');
    const finalOptions = options.length > 0 ? options : parseProductOptions(formData, 'boost');

    await sql`
        INSERT INTO products (name, description, price, platform, boost_amount, game, image_url, how_it_works, requirements, faqs, boost_options, commends_options, options)
        VALUES (${name}, ${description || null}, ${price}, ${platform || null}, ${boostAmount}, ${game}, ${imageUrl || null}, ${howItWorks || null}, ${requirements || null}, ${faqs || null}, ${JSON.stringify(finalOptions)}::jsonb, NULL, ${JSON.stringify(finalOptions)}::jsonb)
    `;

    revalidatePath('/store');
    revalidatePath('/admin/products');
}

export async function deleteProduct(id) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);

    await sql`DELETE FROM products WHERE id = ${id}`;

    revalidatePath('/store');
    revalidatePath('/admin/products');
}

export async function updateProduct(formData) {
    await requireAdmin();
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS how_it_works TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS requirements TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS faqs TEXT`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS commends_options JSONB`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB`;
    await sql`UPDATE products SET options = COALESCE(boost_options, commends_options) WHERE options IS NULL AND boost_options IS NOT NULL`;
    await sql`UPDATE products SET options = COALESCE(boost_options, commends_options) WHERE options IS NULL AND commends_options IS NOT NULL`;

    const id = Number(formData.get('id'));
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid product id.');

    const name = String(formData.get('name') || '').trim();
    const game = String(formData.get('game') || '').trim();
    if (!name) throw new Error('Product name is required.');

    const price = Number(formData.get('price'));
    if (!Number.isFinite(price) || price <= 0) {
        throw new Error('Price must be a positive number.');
    }

    const rawBoostAmount = formData.get('boost_amount');
    const boostAmount = rawBoostAmount === null || rawBoostAmount === '' ? null : Number(rawBoostAmount);
    if (boostAmount !== null && (!Number.isInteger(boostAmount) || boostAmount <= 0)) {
        throw new Error('Boost amount must be a positive integer.');
    }

    const options = parseProductOptions(formData, 'options');
    const finalOptions = options.length > 0 ? options : parseProductOptions(formData, 'boost');

    await sql`
        UPDATE products SET
            name = ${name},
            description = ${formData.get('description') || null},
            price = ${price},
            platform = ${formData.get('platform') || null},
            boost_amount = ${boostAmount},
            game = ${game},
            image_url = ${formData.get('image_url') || null},
            how_it_works = ${formData.get('how_it_works') || null},
            requirements = ${formData.get('requirements') || null},
            faqs = ${formData.get('faqs') || null},
            boost_options = ${JSON.stringify(finalOptions)}::jsonb,
            commends_options = NULL,
            options = ${JSON.stringify(finalOptions)}::jsonb
        WHERE id = ${id}
    `;

    revalidatePath('/store');
    revalidatePath('/admin/products');
}

export async function updateProductSection(productId, section, items) {
    await requireAdmin();

    const allowedColumns = {
        description: 'description',
        how_it_works: 'how_it_works',
        requirements: 'requirements',
        faqs: 'faqs',
    };
    const column = allowedColumns[section];
    if (!column) throw new Error('Invalid section.');

    const sql = neon(process.env.DATABASE_URL);
    const value = items.filter((item) => item.trim()).join('\n');
    if (column === 'how_it_works') await sql`UPDATE products SET how_it_works = ${value} WHERE id = ${productId}`;
    if (column === 'requirements') await sql`UPDATE products SET requirements = ${value} WHERE id = ${productId}`;
    if (column === 'faqs') await sql`UPDATE products SET faqs = ${value} WHERE id = ${productId}`;
    if (column === 'description') await sql`UPDATE products SET description = ${value} WHERE id = ${productId}`;

    revalidatePath(`/store/${productId}`);
}