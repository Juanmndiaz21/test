import { redirect } from 'next/navigation';
import { getAdminSession } from '../../../lib/guard';
import { getBlogPosts } from '../../../lib/blog';
import BlogAdminClient from './BlogAdminClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Blog Management | OGmodz Control Room',
    description: 'Manage, create, and edit blog articles and game guides.'
};

export default async function AdminBlogPage() {
    const session = await getAdminSession();
    if (!session) redirect('/login');

    const posts = await getBlogPosts({ publishedOnly: false });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
            <BlogAdminClient initialPosts={posts} />
        </div>
    );
}
