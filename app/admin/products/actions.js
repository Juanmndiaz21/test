'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import { normalizeOptions } from '../../../lib/serviceDefaults';
import { productToSlug } from '../../../lib/gameSlugs';

function safeRevalidateCatalog(productId) {
    try {
        revalidatePath('/admin/products');
        revalidatePath('/store');
        revalidatePath('/en/store');
        revalidatePath('/es/store');
        if (productId) {
            revalidatePath(`/store/${productId}`);
            revalidatePath(`/en/store/${productId}`);
            revalidatePath(`/es/store/${productId}`);
        }
    } catch (err) {
        console.warn('Revalidation warning (safe to ignore):', err);
    }
}

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
    try {
        await requireAdmin();
        const sql = neon(process.env.DATABASE_URL);

        const name = String(formData.get('name') || '').trim();
        const rawGame = String(formData.get('game') || '').trim();
        if (!name) return { success: false, error: 'Product name is required.' };
        if (!rawGame) return { success: false, error: 'Game category is required.' };

        const existingGame = await sql`SELECT name FROM games WHERE LOWER(name) = LOWER(${rawGame}) LIMIT 1`;
        const game = existingGame[0]?.name || rawGame;

        const price = Number(formData.get('price'));
        if (!Number.isFinite(price) || price <= 0) {
            return { success: false, error: 'Price must be a positive number.' };
        }

        const rawOriginalPrice = formData.get('original_price');
        const originalPrice = rawOriginalPrice === null || rawOriginalPrice === '' ? null : Number(rawOriginalPrice);

        const rawBoostAmount = formData.get('boost_amount');
        const boostAmount = rawBoostAmount === null || rawBoostAmount === '' ? null : Number(rawBoostAmount);
        if (boostAmount !== null && (!Number.isInteger(boostAmount) || boostAmount <= 0)) {
            return { success: false, error: 'Boost amount must be a positive integer.' };
        }

        const description = formData.get('description');
        const platform = formData.get('platform');
        const imageUrl = formData.get('image_url');
        const howItWorks = formData.get('how_it_works');
        const requirements = formData.get('requirements');
        const faqs = formData.get('faqs');
        const features = formData.get('features');
        const rawConfiguratorData = formData.get('configurator_data');
        let configuratorData = null;
        if (rawConfiguratorData) {
            try { configuratorData = JSON.parse(rawConfiguratorData); } catch {}
        }
        const options = parseProductOptions(formData, 'options');
        const finalOptions = options.length > 0 ? options : parseProductOptions(formData, 'boost');
        const slug = productToSlug(name);

        const rawPlatforms = formData.getAll('platform').filter(Boolean);
        const normalizedPlatform = rawPlatforms.length > 1
            ? rawPlatforms.join('/')
            : (formData.get('platform') || platform || null);

        await sql`
            INSERT INTO products (name, slug, description, price, original_price, features, configurator_data, platform, boost_amount, game, image_url, how_it_works, requirements, faqs, boost_options, commends_options, options)
            VALUES (${name}, ${slug}, ${description || null}, ${price}, ${originalPrice}, ${features || null}, ${configuratorData ? JSON.stringify(configuratorData) : null}::jsonb, ${normalizedPlatform}, ${boostAmount}, ${game}, ${imageUrl || null}, ${howItWorks || null}, ${requirements || null}, ${faqs || null}, ${JSON.stringify(finalOptions)}::jsonb, NULL, ${JSON.stringify(finalOptions)}::jsonb)
        `;

        safeRevalidateCatalog();
        return { success: true, error: null };
    } catch (err) {
        console.error('Error adding product:', err);
        return { success: false, error: err.message || 'Failed to add product.' };
    }
}

export async function deleteProduct(id) {
    try {
        await requireAdmin();
        const sql = neon(process.env.DATABASE_URL);

        await sql`DELETE FROM products WHERE id = ${id}`;

        safeRevalidateCatalog(id);
        return { success: true, error: null };
    } catch (err) {
        console.error('Error deleting product:', err);
        return { success: false, error: err.message || 'Failed to delete product.' };
    }
}

export async function updateProduct(formData) {
    try {
        await requireAdmin();
        const sql = neon(process.env.DATABASE_URL);

        const id = Number(formData.get('id'));
        if (!Number.isInteger(id) || id <= 0) {
            return { success: false, error: 'Invalid product id.' };
        }

        const name = String(formData.get('name') || '').trim();
        const rawGame = String(formData.get('game') || '').trim();
        if (!name) return { success: false, error: 'Product name is required.' };

        let game = rawGame;
        if (rawGame) {
            const existingGame = await sql`SELECT name FROM games WHERE LOWER(name) = LOWER(${rawGame}) LIMIT 1`;
            game = existingGame[0]?.name || rawGame;
        }

        const price = Number(formData.get('price'));
        if (!Number.isFinite(price) || price <= 0) {
            return { success: false, error: 'Price must be a positive number.' };
        }

        const rawOriginalPrice = formData.get('original_price');
        const originalPrice = rawOriginalPrice === null || rawOriginalPrice === '' ? null : Number(rawOriginalPrice);

        const rawBoostAmount = formData.get('boost_amount');
        const boostAmount = rawBoostAmount === null || rawBoostAmount === '' ? null : Number(rawBoostAmount);
        if (boostAmount !== null && (!Number.isInteger(boostAmount) || boostAmount <= 0)) {
            return { success: false, error: 'Boost amount must be a positive integer.' };
        }

        const rawConfiguratorData = formData.get('configurator_data');
        let configuratorData = undefined;
        if (rawConfiguratorData !== null && rawConfiguratorData !== undefined) {
            try {
                configuratorData = rawConfiguratorData.trim() ? JSON.parse(rawConfiguratorData) : null;
            } catch {
                configuratorData = null;
            }
        }

        const hasOptionsInForm = formData.get('options_amount_0') !== null || formData.get('boost_amount_0') !== null;
        let finalOptions = undefined;
        if (hasOptionsInForm) {
            const parsedOptions = parseProductOptions(formData, 'options');
            finalOptions = parsedOptions.length > 0 ? parsedOptions : parseProductOptions(formData, 'boost');
        }

        const rawPlatforms = formData.getAll('platform').filter(Boolean);
        const normalizedPlatform = rawPlatforms.length > 1
            ? rawPlatforms.join('/')
            : (formData.get('platform') || null);

        const slug = productToSlug(name);
        const description = formData.get('description') || null;
        const features = formData.get('features') || null;
        const imageUrl = formData.get('image_url') || null;
        const howItWorks = formData.get('how_it_works') || null;
        const requirements = formData.get('requirements') || null;
        const faqs = formData.get('faqs') || null;

        // Perform atomic update without destructive option wiping
        if (configuratorData !== undefined && finalOptions !== undefined) {
            await sql`
                UPDATE products SET
                    name = ${name},
                    slug = ${slug},
                    description = ${description},
                    price = ${price},
                    original_price = ${originalPrice},
                    features = ${features},
                    configurator_data = ${configuratorData ? JSON.stringify(configuratorData) : null}::jsonb,
                    platform = ${normalizedPlatform},
                    boost_amount = ${boostAmount},
                    game = ${game},
                    image_url = ${imageUrl},
                    how_it_works = ${howItWorks},
                    requirements = ${requirements},
                    faqs = ${faqs},
                    boost_options = ${JSON.stringify(finalOptions)}::jsonb,
                    commends_options = NULL,
                    options = ${JSON.stringify(finalOptions)}::jsonb
                WHERE id = ${id}
            `;
        } else if (configuratorData !== undefined && finalOptions === undefined) {
            await sql`
                UPDATE products SET
                    name = ${name},
                    slug = ${slug},
                    description = ${description},
                    price = ${price},
                    original_price = ${originalPrice},
                    features = ${features},
                    configurator_data = ${configuratorData ? JSON.stringify(configuratorData) : null}::jsonb,
                    platform = ${normalizedPlatform},
                    boost_amount = ${boostAmount},
                    game = ${game},
                    image_url = ${imageUrl},
                    how_it_works = ${howItWorks},
                    requirements = ${requirements},
                    faqs = ${faqs}
                WHERE id = ${id}
            `;
        } else if (configuratorData === undefined && finalOptions !== undefined) {
            await sql`
                UPDATE products SET
                    name = ${name},
                    slug = ${slug},
                    description = ${description},
                    price = ${price},
                    original_price = ${originalPrice},
                    features = ${features},
                    platform = ${normalizedPlatform},
                    boost_amount = ${boostAmount},
                    game = ${game},
                    image_url = ${imageUrl},
                    how_it_works = ${howItWorks},
                    requirements = ${requirements},
                    faqs = ${faqs},
                    boost_options = ${JSON.stringify(finalOptions)}::jsonb,
                    commends_options = NULL,
                    options = ${JSON.stringify(finalOptions)}::jsonb
                WHERE id = ${id}
            `;
        } else {
            await sql`
                UPDATE products SET
                    name = ${name},
                    slug = ${slug},
                    description = ${description},
                    price = ${price},
                    original_price = ${originalPrice},
                    features = ${features},
                    platform = ${normalizedPlatform},
                    boost_amount = ${boostAmount},
                    game = ${game},
                    image_url = ${imageUrl},
                    how_it_works = ${howItWorks},
                    requirements = ${requirements},
                    faqs = ${faqs}
                WHERE id = ${id}
            `;
        }

        safeRevalidateCatalog(id);
        return { success: true, error: null };
    } catch (err) {
        console.error('Error updating product:', err);
        return { success: false, error: err.message || 'Failed to update product.' };
    }
}

export async function updateProductPlatform(id, platform) {
    try {
        await requireAdmin();
        const productId = Number(id);
        if (!Number.isInteger(productId) || productId <= 0) {
            return { success: false, error: 'Invalid product id.' };
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`UPDATE products SET platform = ${platform || null} WHERE id = ${productId}`;

        safeRevalidateCatalog(productId);
        return { success: true, platform, error: null };
    } catch (err) {
        console.error('Error updating product platform:', err);
        return { success: false, error: err.message || 'Failed to update platform.' };
    }
}

export async function updateProductSection(productId, section, items) {
    try {
        await requireAdmin();

        const allowedColumns = {
            description: 'description',
            how_it_works: 'how_it_works',
            requirements: 'requirements',
            faqs: 'faqs',
        };
        const column = allowedColumns[section];
        if (!column) return { success: false, error: 'Invalid section.' };

        const sql = neon(process.env.DATABASE_URL);
        const value = items.filter((item) => item.trim()).join('\n');
        if (column === 'how_it_works') await sql`UPDATE products SET how_it_works = ${value} WHERE id = ${productId}`;
        if (column === 'requirements') await sql`UPDATE products SET requirements = ${value} WHERE id = ${productId}`;
        if (column === 'faqs') await sql`UPDATE products SET faqs = ${value} WHERE id = ${productId}`;
        if (column === 'description') await sql`UPDATE products SET description = ${value} WHERE id = ${productId}`;

        safeRevalidateCatalog(productId);
        return { success: true, error: null };
    } catch (err) {
        console.error('Error updating product section:', err);
        return { success: false, error: err.message || 'Failed to update section.' };
    }
}