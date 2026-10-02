'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { IconPhoto as LuImage } from '@tabler/icons-react';
import BlogCoverUpload from '@/components/BlogCoverUpload';
import { toast } from '@/utils/toast';
import {
    saveBlogPostAction,
    deleteBlogPostAction,
    toggleFeaturedAction,
    togglePublishedAction,
    updateBlogCoverAction
} from './actions';

const DEFAULT_CATEGORIES = ['GTA 5', 'CS2', 'RDR2', 'GTA 6', 'Guides', 'News', 'General'];

const EMPTY_POST = {
    id: null,
    title: '',
    slug: '',
    category: 'Guides',
    author: 'OGmodz Specialist',
    read_time: '5 min read',
    image_url: '',
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_featured: false,
    published: true
};

export default function BlogAdminClient({ initialPosts }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activePost, setActivePost] = useState(EMPTY_POST);
    const [coverModalPost, setCoverModalPost] = useState(null);
    const [tempCoverUrl, setTempCoverUrl] = useState('');
    const [isContentImageModalOpen, setIsContentImageModalOpen] = useState(false);
    const [contentModalImageUrl, setContentModalImageUrl] = useState('');
    const [contentModalImageAlt, setContentModalImageAlt] = useState('');
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'content' | 'seo'

    const filteredPosts = posts.filter((p) => {
        const matchesCategory = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
        const matchesSearch =
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase()) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...posts.map((p) => p.category)]))];

    const openNewModal = () => {
        setActivePost(EMPTY_POST);
        setErrorMsg('');
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const openEditModal = (post) => {
        setActivePost({
            id: post.id,
            title: post.title || '',
            slug: post.slug || '',
            category: post.category || 'Guides',
            author: post.author || 'OGmodz Specialist',
            read_time: post.read_time || '5 min read',
            image_url: post.image_url || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            meta_title: post.meta_title || post.title || '',
            meta_description: post.meta_description || post.excerpt || '',
            is_featured: Boolean(post.is_featured),
            published: Boolean(post.published)
        });
        setErrorMsg('');
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const openCoverModal = (post) => {
        setCoverModalPost(post);
        setTempCoverUrl(post.image_url || '');
    };

    const handleSaveQuickCover = async () => {
        if (!coverModalPost) return;
        startTransition(async () => {
            try {
                await updateBlogCoverAction(coverModalPost.id, tempCoverUrl);
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === coverModalPost.id ? { ...p, image_url: tempCoverUrl } : p
                    )
                );
                toast.success('Cover image updated successfully!');
                setCoverModalPost(null);
            } catch (err) {
                toast.error(err.message || 'Error updating cover photo');
            }
        });
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setActivePost((prev) => {
            const next = { ...prev, title: val };
            if (!prev.id && (!prev.slug || prev.slug === slugify(prev.title))) {
                next.slug = slugify(val);
            }
            if (!prev.meta_title || prev.meta_title === prev.title) {
                next.meta_title = val;
            }
            return next;
        });
    };

    const handleExcerptChange = (e) => {
        const val = e.target.value;
        setActivePost((prev) => {
            const next = { ...prev, excerpt: val };
            if (!prev.meta_description || prev.meta_description === prev.excerpt) {
                next.meta_description = val;
            }
            return next;
        });
    };

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = document.getElementById('blog-content-input');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = `${prefix}${selected || 'text'}${suffix}`;
        const newContent = text.substring(0, start) + replacement + text.substring(end);
        
        setActivePost((prev) => ({ ...prev, content: newContent }));
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
        }, 10);
    };

    const insertRawText = (insertedText) => {
        const textarea = document.getElementById('blog-content-input');
        if (!textarea) {
            setActivePost((prev) => ({ ...prev, content: (prev.content || '') + insertedText }));
            return;
        }
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        const text = textarea.value;
        const newContent = text.substring(0, start) + insertedText + text.substring(end);

        setActivePost((prev) => ({ ...prev, content: newContent }));
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertedText.length, start + insertedText.length);
        }, 10);
    };

    const handleContentDrop = async (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            toast.info('Uploading dropped image...');
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Upload failed');

                const caption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                insertRawText(`\n\n![${caption}](${data.url})\n\n`);
                toast.success('Image uploaded and inserted into article!');
            } catch (err) {
                toast.error(err.message || 'Error uploading image');
            }
        }
    };

    const handleInsertContentImage = () => {
        if (!contentModalImageUrl) {
            toast.warning('Please select or upload an image first');
            return;
        }
        const caption = (contentModalImageAlt || 'Illustration').trim();
        insertRawText(`\n\n![${caption}](${contentModalImageUrl})\n\n`);
        setContentModalImageUrl('');
        setContentModalImageAlt('');
        setIsContentImageModalOpen(false);
        toast.success('Image inserted into article!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formData = new FormData();
        if (activePost.id) formData.set('id', activePost.id);
        formData.set('title', activePost.title);
        formData.set('slug', activePost.slug || slugify(activePost.title));
        formData.set('category', activePost.category);
        formData.set('author', activePost.author);
        formData.set('read_time', activePost.read_time);
        formData.set('image_url', activePost.image_url);
        formData.set('excerpt', activePost.excerpt);
        formData.set('content', activePost.content);
        formData.set('meta_title', activePost.meta_title);
        formData.set('meta_description', activePost.meta_description);
        formData.set('is_featured', activePost.is_featured ? 'true' : 'false');
        formData.set('published', activePost.published ? 'true' : 'false');

        startTransition(async () => {
            try {
                await saveBlogPostAction(formData);
                setIsModalOpen(false);
                // Optimistic refresh
                window.location.reload();
            } catch (err) {
                setErrorMsg(err.message || 'Error saving blog post');
            }
        });
    };

    const handleDelete = async (post) => {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
        startTransition(async () => {
            try {
                await deleteBlogPostAction(post.id);
                setPosts((prev) => prev.filter((p) => p.id !== post.id));
            } catch (err) {
                alert(err.message || 'Error deleting post');
            }
        });
    };

    const handleToggleFeatured = async (post) => {
        startTransition(async () => {
            try {
                await toggleFeaturedAction(post.id, post.is_featured);
                setPosts((prev) =>
                    prev.map((p) => ({
                        ...p,
                        is_featured: p.id === post.id ? !post.is_featured : false
                    }))
                );
            } catch (err) {
                alert(err.message || 'Error toggling featured status');
            }
        });
    };

    const handleTogglePublished = async (post) => {
        startTransition(async () => {
            try {
                await togglePublishedAction(post.id, post.published);
                setPosts((prev) =>
                    prev.map((p) => (p.id === post.id ? { ...p, published: !post.published } : p))
                );
            } catch (err) {
                alert(err.message || 'Error toggling published status');
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-[#9d7cff]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9d7cff]">
                            Content Management System
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Blog & Guides
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Create, edit, and organize SEO articles and gaming guides for OGmodz.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/blog"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-sm font-bold transition-colors"
                    >
                        <Icon name="arrow-up-right" className="w-4 h-4 text-[#9d7cff]" />
                        View Live Blog
                    </Link>
                    <button
                        onClick={openNewModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] font-black text-sm transition-transform active:scale-95 shadow-[0_4px_20px_rgba(157,124,255,0.3)] cursor-pointer"
                    >
                        <Icon name="plus" className="w-4 h-4" />
                        New Post
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="panel-surface p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-400 uppercase font-mono">Total Posts</span>
                    <p className="text-2xl font-black text-white mt-1">{posts.length}</p>
                </div>
                <div className="panel-surface p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-400 uppercase font-mono">Published</span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                        {posts.filter((p) => p.published).length}
                    </p>
                </div>
                <div className="panel-surface p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-400 uppercase font-mono">Drafts</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">
                        {posts.filter((p) => !p.published).length}
                    </p>
                </div>
                <div className="panel-surface p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-400 uppercase font-mono">Featured</span>
                    <p className="text-2xl font-black text-[#9d7cff] mt-1">
                        {posts.filter((p) => p.is_featured).length}
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="panel-surface p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search posts by title, slug, or content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#120e1c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#9d7cff] transition-colors"
                    />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                categoryFilter.toLowerCase() === cat.toLowerCase()
                                    ? 'bg-[#9d7cff] text-[#0d0914]'
                                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Table */}
            <div className="panel-surface rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                {filteredPosts.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 space-y-3">
                        <Icon name="book" className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="text-base font-bold text-slate-300">No blog posts found</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Try adjusting your search query or category filter, or create a brand new article.
                        </p>
                        <button
                            onClick={openNewModal}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9d7cff]/20 text-[#9d7cff] hover:bg-[#9d7cff] hover:text-[#0d0914] text-xs font-bold transition-colors cursor-pointer"
                        >
                            <Icon name="plus" className="w-3.5 h-3.5" />
                            Write First Post
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-mono uppercase tracking-wider text-slate-400">
                                    <th className="py-3.5 px-4">Article</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Author / Read</th>
                                    <th className="py-3.5 px-4 text-center">Featured</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openCoverModal(post)}
                                                    title="Click to view, upload, or change cover photo"
                                                    className="group/thumb relative w-14 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-[#9d7cff] transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-[#9d7cff]"
                                                >
                                                    {post.image_url ? (
                                                        <img
                                                            src={post.image_url}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-slate-500 group-hover/thumb:text-[#9d7cff]">
                                                            <Icon name="book" className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-[#9d7cff]">
                                                        <LuImage className="w-4 h-4" />
                                                    </div>
                                                </button>
                                                <div className="min-w-0 max-w-sm">
                                                    <p className="font-bold text-white truncate group-hover:text-[#9d7cff] transition-colors">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                                                        /blog/{post.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-white/5 border border-white/10 text-[#9d7cff]">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                                            <p className="font-medium text-slate-300">{post.author}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{post.read_time}</p>
                                        </td>
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleFeatured(post)}
                                                title={post.is_featured ? 'Featured post' : 'Click to feature'}
                                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                                    post.is_featured
                                                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                                                        : 'text-slate-600 hover:text-slate-400 border-transparent hover:border-white/10'
                                                }`}
                                            >
                                                <Icon name="star" className="w-4 h-4 fill-current" />
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleTogglePublished(post)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                                    post.published
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        post.published ? 'bg-emerald-400' : 'bg-amber-400'
                                                    }`}
                                                />
                                                {post.published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    title="View live post"
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <Icon name="arrow-up-right" className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => openCoverModal(post)}
                                                    title="Change cover photo"
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 text-slate-400 hover:text-[#9d7cff] border border-white/10 transition-colors cursor-pointer"
                                                >
                                                    <LuImage className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(post)}
                                                    title="Edit post"
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-[#9d7cff]/20 text-slate-300 hover:text-[#9d7cff] border border-white/10 transition-colors cursor-pointer"
                                                >
                                                    <Icon name="edit" className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post)}
                                                    title="Delete post"
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors cursor-pointer"
                                                >
                                                    <Icon name="trash" className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form for Add / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#120e1c] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161126]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#9d7cff]/10 text-[#9d7cff] border border-[#9d7cff]/20">
                                    <Icon name={activePost.id ? 'edit' : 'plus'} className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">
                                        {activePost.id ? 'Edit Blog Article' : 'Create New Blog Article'}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Fill in details, markdown body, and SEO metadata.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex border-b border-white/10 px-5 bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('general')}
                                className={`py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                                    activeTab === 'general'
                                        ? 'border-[#9d7cff] text-[#9d7cff]'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                1. General & Cover
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('content')}
                                className={`py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                                    activeTab === 'content'
                                        ? 'border-[#9d7cff] text-[#9d7cff]'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                2. Article Content
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('seo')}
                                className={`py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                                    activeTab === 'seo'
                                        ? 'border-[#9d7cff] text-[#9d7cff]'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                3. SEO & Indexing
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {errorMsg && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
                                    <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* TAB 1: General */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                            Article Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Complete GTA 5 Online Beginner to Millionaire Guide"
                                            value={activePost.title}
                                            onChange={handleTitleChange}
                                            className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#9d7cff] focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                URL Slug *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                                                    /blog/
                                                </span>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="article-url-slug"
                                                    value={activePost.slug}
                                                    onChange={(e) =>
                                                        setActivePost((prev) => ({
                                                            ...prev,
                                                            slug: slugify(e.target.value)
                                                        }))
                                                    }
                                                    className="w-full bg-[#171229] border border-white/10 rounded-xl pl-16 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-[#9d7cff] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                Category *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                list="category-options"
                                                placeholder="GTA 5, CS2, Guides, News..."
                                                value={activePost.category}
                                                onChange={(e) =>
                                                    setActivePost((prev) => ({
                                                        ...prev,
                                                        category: e.target.value
                                                    }))
                                                }
                                                className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                            />
                                            <datalist id="category-options">
                                                {DEFAULT_CATEGORIES.map((c) => (
                                                    <option key={c} value={c} />
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                Author Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. OGmodz Specialist"
                                                value={activePost.author}
                                                onChange={(e) =>
                                                    setActivePost((prev) => ({
                                                        ...prev,
                                                        author: e.target.value
                                                    }))
                                                }
                                                className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                                Estimated Read Time
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 5 min read"
                                                value={activePost.read_time}
                                                onChange={(e) =>
                                                    setActivePost((prev) => ({
                                                        ...prev,
                                                        read_time: e.target.value
                                                    }))
                                                }
                                                className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <BlogCoverUpload
                                        value={activePost.image_url}
                                        onChange={(url) =>
                                            setActivePost((prev) => ({
                                                ...prev,
                                                image_url: url
                                            }))
                                        }
                                    />

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                            Short Excerpt / Preview Summary
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Brief 1-2 sentence overview shown in blog cards and search results..."
                                            value={activePost.excerpt}
                                            onChange={handleExcerptChange}
                                            className="w-full bg-[#171229] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                        />
                                    </div>

                                    {/* Flags */}
                                    <div className="flex flex-wrap gap-6 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={activePost.published}
                                                onChange={(e) =>
                                                    setActivePost((prev) => ({
                                                        ...prev,
                                                        published: e.target.checked
                                                    }))
                                                }
                                                className="w-4 h-4 rounded accent-[#9d7cff]"
                                            />
                                            <span className="text-sm font-bold text-white">Publish Immediately</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={activePost.is_featured}
                                                onChange={(e) =>
                                                    setActivePost((prev) => ({
                                                        ...prev,
                                                        is_featured: e.target.checked
                                                    }))
                                                }
                                                className="w-4 h-4 rounded accent-[#9d7cff]"
                                            />
                                            <span className="text-sm font-bold text-amber-300">
                                                Featured Hero Article
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: Content */}
                            {activeTab === 'content' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Article Body (Markdown Supported) *
                                        </label>
                                        {/* Quick Markdown Toolbar */}
                                        <div className="flex items-center gap-1.5 bg-[#171229] p-1 rounded-lg border border-white/10">
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n## ', '\n')}
                                                className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                                                title="Heading 2"
                                            >
                                                H2
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n### ', '\n')}
                                                className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                                                title="Heading 3"
                                            >
                                                H3
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('**', '**')}
                                                className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                                                title="Bold"
                                            >
                                                B
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n* ', '')}
                                                className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                                                title="Bullet List"
                                            >
                                                • List
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => insertFormatting('\n> ', '')}
                                                className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                                                title="Quote"
                                            >
                                                &quot; Quote
                                            </button>
                                            <span className="w-px h-4 bg-white/10 mx-0.5" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setContentModalImageUrl('');
                                                    setContentModalImageAlt('');
                                                    setIsContentImageModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-[#9d7cff] hover:text-[#0d0914] bg-[#9d7cff]/15 hover:bg-[#9d7cff] rounded cursor-pointer transition-colors border border-[#9d7cff]/30"
                                                title="Upload and insert an image illustration"
                                            >
                                                <LuImage className="w-3.5 h-3.5" />
                                                <span>+ Subir Foto</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            id="blog-content-input"
                                            rows={16}
                                            required
                                            placeholder="Write your article in markdown. Use # for titles, ## for sections, * for bullet lists, and > for quotes... (You can also drag & drop image files directly here!)"
                                            value={activePost.content}
                                            onDrop={handleContentDrop}
                                            onChange={(e) =>
                                                setActivePost((prev) => ({
                                                    ...prev,
                                                    content: e.target.value
                                                }))
                                            }
                                            className="w-full bg-[#171229] border border-white/10 rounded-xl p-4 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-[#9d7cff] focus:outline-none leading-relaxed transition-colors"
                                        />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 mt-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <span>💡 Arrastra y suelta fotos aquí o usa</span>
                                                <strong className="text-[#9d7cff]">&quot;+ Subir Foto&quot;</strong>
                                            </span>
                                            <span className="font-mono text-slate-500">
                                                Formato: <code>![pie de foto](url)</code>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: SEO */}
                            {activeTab === 'seo' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                                        Search Engine Optimization controls ensure high rankings on Google for queries like &quot;GTA 5 money guide&quot; or &quot;CS2 rank rating&quot;.
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Meta Title (Google SERP Title)
                                            </label>
                                            <span className="text-[11px] font-mono text-slate-500">
                                                {(activePost.meta_title || '').length} / 60 chars
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Catchy headline under 60 characters..."
                                            value={activePost.meta_title}
                                            onChange={(e) =>
                                                setActivePost((prev) => ({
                                                    ...prev,
                                                    meta_title: e.target.value
                                                }))
                                            }
                                            className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Meta Description (Snippet)
                                            </label>
                                            <span className="text-[11px] font-mono text-slate-500">
                                                {(activePost.meta_description || '').length} / 160 chars
                                            </span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            placeholder="Concise 150-160 character summary that invites searchers to click..."
                                            value={activePost.meta_description}
                                            onChange={(e) =>
                                                setActivePost((prev) => ({
                                                    ...prev,
                                                    meta_description: e.target.value
                                                }))
                                            }
                                            className="w-full bg-[#171229] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#9d7cff] focus:outline-none"
                                        />
                                    </div>

                                    {/* Google SERP Live Simulation */}
                                    <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10">
                                        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                                            Google SERP Preview
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-xs text-[#9d7cff] font-mono">
                                                https://www.ogmodz.com &gt; blog &gt; {activePost.slug || 'article-slug'}
                                            </p>
                                            <p className="text-base text-blue-400 hover:underline font-medium cursor-pointer">
                                                {activePost.meta_title || activePost.title || 'Article Headline'}
                                            </p>
                                            <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                                                {activePost.meta_description || activePost.excerpt || 'Article summary snippet preview for search engines...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <div className="flex items-center gap-3">
                                    {activeTab !== 'general' && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(activeTab === 'seo' ? 'content' : 'general')
                                            }
                                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-colors cursor-pointer"
                                        >
                                            Back
                                        </button>
                                    )}
                                    {activeTab !== 'seo' ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(activeTab === 'general' ? 'content' : 'seo')
                                            }
                                            className="px-5 py-2.5 rounded-xl bg-[#9d7cff]/20 hover:bg-[#9d7cff]/30 text-[#9d7cff] border border-[#9d7cff]/40 text-sm font-bold transition-colors cursor-pointer"
                                        >
                                            Next Step →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] text-sm font-black transition-all shadow-[0_4px_16px_rgba(157,124,255,0.35)] cursor-pointer disabled:opacity-50"
                                        >
                                            {isPending ? 'Saving...' : activePost.id ? 'Save Changes' : 'Publish Article'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Cover Image Modal */}
            {coverModalPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-[#120e1c] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161126]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#9d7cff]/15 text-[#9d7cff] border border-[#9d7cff]/30">
                                    <LuImage className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9d7cff]">
                                            Quick Cover Editor
                                        </span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black text-white truncate max-w-md">
                                        {coverModalPost.title}
                                    </h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setCoverModalPost(null)}
                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                            <BlogCoverUpload
                                value={tempCoverUrl}
                                onChange={(url) => setTempCoverUrl(url)}
                                label="Cover Photo (16:9 Banner)"
                            />

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCoverModalPost(null)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveQuickCover}
                                    disabled={isPending}
                                    className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] text-xs font-black transition-all shadow-[0_4px_16px_rgba(157,124,255,0.35)] cursor-pointer disabled:opacity-50"
                                >
                                    {isPending ? 'Saving Cover...' : 'Save Cover Photo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* In-Article Image Insert Modal */}
            {isContentImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-[#120e1c] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161126]">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#9d7cff]/15 text-[#9d7cff] border border-[#9d7cff]/30">
                                    <LuImage className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-black text-white">
                                        Subir e Insertar Imagen en el Artículo
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Sube una captura desde tu PC, elige de la biblioteca o pega un enlace
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsContentImageModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                            <BlogCoverUpload
                                value={contentModalImageUrl}
                                onChange={(url) => setContentModalImageUrl(url)}
                                label="Seleccionar o Subir Imagen"
                                recommendedText="PNG, JPG, WEBP o GIF hasta 5 MB"
                            />

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Pie de Foto / Texto Alternativo (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Mapa de Vice City en GTA 6"
                                    value={contentModalImageAlt}
                                    onChange={(e) => setContentModalImageAlt(e.target.value)}
                                    className="w-full bg-[#171229] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#9d7cff] focus:outline-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setIsContentImageModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleInsertContentImage}
                                    disabled={!contentModalImageUrl}
                                    className="px-6 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] text-xs font-black transition-all shadow-[0_4px_16px_rgba(157,124,255,0.35)] cursor-pointer disabled:opacity-40"
                                >
                                    Insertar en el Artículo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
