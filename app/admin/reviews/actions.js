'use server'
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import {
    createReview as createReviewRecord,
    deleteReview as deleteReviewRecord,
    updateReview as updateReviewRecord,
    updateReviewStatus as updateReviewStatusRecord,
    approveAllReviews as approveAllReviewsRecord,
} from '../../../lib/reviews';

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

function revalidateReviewViews() {
    revalidatePath('/admin/reviews');
    revalidatePath('/');
    revalidatePath('/[locale]', 'page');
    revalidatePath('/es');
    revalidatePath('/en');
    revalidatePath('/store');
}

export async function approveAllReviews() {
    await requireAdmin();

    const result = await approveAllReviewsRecord();
    if (!result.ok) throw new Error(result.error || 'Could not approve all reviews.');

    revalidateReviewViews();
    return result;
}

export async function updateReviewStatus(formData) {
    await requireAdmin();

    const id = String(formData.get('id') || '');
    const status = String(formData.get('status') || '');
    if (!id) throw new Error('Review ID is required.');
    if (!VALID_STATUSES.has(status)) throw new Error('Invalid review status.');

    const result = await updateReviewStatusRecord(id, status);
    if (!result.ok) throw new Error(result.error || 'Could not update review status.');

    revalidateReviewViews();
}

export async function deleteReview(formData) {
    await requireAdmin();

    const id = String(formData.get('id') || '');
    if (!id) throw new Error('Review ID is required.');

    const result = await deleteReviewRecord(id);
    if (!result.ok) throw new Error(result.error || 'Could not delete review.');

    revalidateReviewViews();
}

export async function createReview(prevState, formData) {
    await requireAdmin();

    const productId = String(formData.get('product_id') || '').trim();
    const rating = Number(formData.get('rating'));
    const title = String(formData.get('title') || '').trim();
    const author = String(formData.get('author') || '').trim();
    const content = String(formData.get('content') || '').trim();
    const status = String(formData.get('status') || 'approved').trim();

    if (!productId) return { error: 'Product is required.' };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { error: 'Rating must be between 1 and 5.' };
    }
    if (!title) return { error: 'Title is required.' };
    if (!content) return { error: 'Review text is required.' };
    if (status && !VALID_STATUSES.has(status)) {
        return { error: 'Invalid review status.' };
    }

    const result = await createReviewRecord({
        product_id: productId,
        rating,
        title,
        author: author || 'Site admin',
        content,
        status: status || 'approved',
    });
    if (!result.ok) return { error: result.error || 'Could not create review.' };

    revalidateReviewViews();

    return { error: null };
}

export async function updateReview(formData) {
    await requireAdmin();

    const id = String(formData.get('id') || '').trim();
    const productId = String(formData.get('product_id') || '').trim();
    const rating = Number(formData.get('rating'));
    const title = String(formData.get('title') || '').trim();
    const author = String(formData.get('author') || '').trim();
    const content = String(formData.get('content') || '').trim();
    const status = String(formData.get('status') || '').trim();

    if (!id) throw new Error('Review ID is required.');
    if (!title) throw new Error('Title is required.');
    if (!content) throw new Error('Review text is required.');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5.');
    }
    if (status && !VALID_STATUSES.has(status)) {
        throw new Error('Invalid status.');
    }

    const result = await updateReviewRecord(id, {
        product_id: productId || undefined,
        rating,
        title,
        author: author || 'Customer',
        content,
        status: status || undefined,
    });
    if (!result.ok) throw new Error(result.error || 'Could not update review.');

    revalidateReviewViews();
}
