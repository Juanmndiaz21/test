'use server'
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';

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

    await sql`
        INSERT INTO products (name, description, price, platform, boost_amount, game, image_url, how_it_works, requirements, faqs)
        VALUES (${name}, ${description || null}, ${price}, ${platform || null}, ${boostAmount}, ${game}, ${imageUrl || null}, ${howItWorks || null}, ${requirements || null}, ${faqs || null})
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

    const id = Number(formData.get('id'));
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid product id.');

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
            faqs = ${formData.get('faqs') || null}
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