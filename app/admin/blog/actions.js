'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/guard';
import {
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    slugify
} from '../../../lib/blog';

export async function saveBlogPostAction(formData) {
    await requireAdmin();

    const id = formData.get('id');
    const title = formData.get('title');
    const slug = formData.get('slug') || slugify(title);
    const category = formData.get('category') || 'Guides';
    const author = formData.get('author') || 'OGmodz Specialist';
    const read_time = formData.get('read_time') || '5 min read';
    const image_url = formData.get('image_url');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const meta_title = formData.get('meta_title');
    const meta_description = formData.get('meta_description');
    const is_featured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true';
    const published = formData.get('published') === 'on' || formData.get('published') === 'true';

    const postData = {
        title,
        slug,
        category,
        author,
        read_time,
        image_url,
        excerpt,
        content,
        meta_title,
        meta_description,
        is_featured,
        published
    };

    if (id) {
        await updateBlogPost(Number(id), postData);
    } else {
        await createBlogPost(postData);
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    if (slug) {
        revalidatePath(`/blog/${slug}`);
    }

    return { success: true };
}

export async function deleteBlogPostAction(id) {
    await requireAdmin();
    if (!id) throw new Error('ID is required');

    await deleteBlogPost(Number(id));

    revalidatePath('/admin/blog');
    revalidatePath('/blog');

    return { success: true };
}

export async function toggleFeaturedAction(id, currentStatus) {
    await requireAdmin();
    if (!id) throw new Error('ID is required');

    await updateBlogPost(Number(id), {
        is_featured: !currentStatus
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');

    return { success: true };
}

export async function togglePublishedAction(id, currentStatus) {
    await requireAdmin();
    if (!id) throw new Error('ID is required');

    await updateBlogPost(Number(id), {
        published: !currentStatus
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');

    return { success: true };
}
