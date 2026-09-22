'use client';

import { useState, useTransition, useId, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { toast } from '../../../utils/toast';
import { addGame, updateGameCategory, deleteGame } from '../../store/actions';
import ImageUploadField from '../products/ImageUploadField';
import GameLogo from '../../../components/GameLogo';
import Icon from '../../../components/Icon';

const PAGE_SIZE = 8;

export default function CategoryManager({ initialCategories = [] }) {
    const [categories, setCategories] = useState(initialCategories);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);

    // Add state
    const [newName, setNewName] = useState('');
    const [newMode, setNewMode] = useState('both');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isAdding, startAddTransition] = useTransition();

    // Edit state
    const [editingGame, setEditingGame] = useState(null);
    const [editName, setEditName] = useState('');
    const [editMode, setEditMode] = useState('both');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [isEditing, startEditTransition] = useTransition();

    // Delete state
    const [deletingName, setDeletingName] = useState(null);
    const [isDeleting, startDeleteTransition] = useTransition();

    const searchInputId = useId();
    const addNameInputId = useId();
    const addModeSelectId = useId();
    const editNameInputId = useId();
    const editModeSelectId = useId();

    const filtered = categories.filter((c) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex = (safePage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
    const paginatedCategories = filtered.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        const target = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(target);
    };

    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (safePage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (safePage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
    }, [totalPages, safePage]);

    const handleAdd = (e) => {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) {
            toast.error('Game name is required');
            return;
        }

        const fd = new FormData();
        fd.set('name', trimmed);
        fd.set('mode', newMode);
        fd.set('image_url', newImageUrl.trim());

        startAddTransition(async () => {
            try {
                await addGame(fd);
                toast.success(`Category "${trimmed}" added!`);
                setCategories((prev) => {
                    const existingIdx = prev.findIndex(
                        (g) => g.name.toLowerCase() === trimmed.toLowerCase()
                    );
                    const item = {
                        id: existingIdx >= 0 ? prev[existingIdx].id : Date.now(),
                        name: trimmed,
                        mode: newMode,
                        image_url: newImageUrl.trim() || null,
                        product_count: existingIdx >= 0 ? prev[existingIdx].product_count : 0,
                    };
                    if (existingIdx >= 0) {
                        const copy = [...prev];
                        copy[existingIdx] = item;
                        return copy;
                    }
                    return [item, ...prev];
                });
                setNewName('');
                setNewImageUrl('');
                setNewMode('both');
                setShowAddForm(false);
            } catch (err) {
                toast.error(err.message || 'Failed to add category');
            }
        });
    };

    const openEditModal = (cat) => {
        setEditingGame(cat);
        setEditName(cat.name || '');
        setEditMode(cat.mode || 'both');
        setEditImageUrl(cat.image_url || '');
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!editingGame) return;
        const trimmed = editName.trim();
        if (!trimmed) {
            toast.error('Game name is required');
            return;
        }

        const fd = new FormData();
        fd.set('original_name', editingGame.name);
        fd.set('name', trimmed);
        fd.set('mode', editMode);
        fd.set('image_url', editImageUrl.trim());

        startEditTransition(async () => {
            try {
                await updateGameCategory(fd);
                toast.success(`Category "${trimmed}" updated!`);
                setCategories((prev) =>
                    prev.map((c) =>
                        c.name.toLowerCase() === editingGame.name.toLowerCase()
                            ? {
                                  ...c,
                                  name: trimmed,
                                  mode: editMode,
                                  image_url: editImageUrl.trim() || null,
                              }
                            : c
                    )
                );
                setEditingGame(null);
            } catch (err) {
                toast.error(err.message || 'Failed to update category');
            }
        });
    };

    const handleDelete = (cat) => {
        const msg =
            cat.product_count > 0
                ? `Category "${cat.name}" has ${cat.product_count} linked service(s). Deleting it will detach these services. Are you sure?`
                : `Are you sure you want to delete category "${cat.name}"?`;

        if (!confirm(msg)) return;

        setDeletingName(cat.name);
        startDeleteTransition(async () => {
            try {
                await deleteGame(cat.name);
                toast.success(`Category "${cat.name}" deleted`);
                setCategories((prev) =>
                    prev.filter((c) => c.name.toLowerCase() !== cat.name.toLowerCase())
                );
            } catch (err) {
                toast.error(err.message || 'Failed to delete category');
            } finally {
                setDeletingName(null);
            }
        });
    };

    return (
        <div>
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Icon
                        name="search"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    />
                    <input
                        id={searchInputId}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search categories / games..."
                        className="w-full bg-[#171229] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#9d7cff] outline-none transition-colors"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center justify-center gap-2 bg-[#9d7cff] hover:bg-white text-[#0d0914] font-black text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_16px_rgba(157,124,255,0.25)] cursor-pointer"
                >
                    <Icon name={showAddForm ? 'minus' : 'plus'} className="w-4 h-4" />
                    <span>{showAddForm ? 'Hide Form' : 'New Category'}</span>
                </button>
            </div>

            {/* Add Category Collapsible Form */}
            {showAddForm && (
                <form
                    onSubmit={handleAdd}
                    className="panel-surface rounded-2xl p-6 mb-8 border border-[#9d7cff]/30 bg-[#171229] space-y-5 animate-in fade-in duration-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="eyebrow text-[#9d7cff]">Create</p>
                            <h3 className="display-font text-2xl uppercase text-white">
                                Add New Category / Game
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor={addNameInputId}
                                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                            >
                                Category / Game Name *
                            </label>
                            <input
                                id={addNameInputId}
                                type="text"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Counter-Strike 2, ARC Raiders, GTA V"
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor={addModeSelectId}
                                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                            >
                                Supported Modes
                            </label>
                            <select
                                id={addModeSelectId}
                                value={newMode}
                                onChange={(e) => setNewMode(e.target.value)}
                                className="w-full bg-[#120e1c] border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none"
                            >
                                <option value="both">Multiplayer + Singleplayer</option>
                                <option value="multiplayer">Multiplayer Only</option>
                                <option value="singleplayer">Singleplayer Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload / Select */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <ImageUploadField
                            label="Category Logo / Image (Upload from PC or pick existing)"
                            value={newImageUrl}
                            onChange={setNewImageUrl}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/30 text-sm font-bold transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="px-6 py-2.5 rounded-lg bg-[#9d7cff] hover:bg-white disabled:opacity-50 text-[#0d0914] font-black text-sm uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            {isAdding ? 'Adding...' : 'Create Category'}
                        </button>
                    </div>
                </form>
            )}

            {/* Categories Table / Cards */}
            <div className="panel-surface rounded-2xl overflow-hidden border border-white/10 bg-[#171229]">
                <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-black uppercase text-white tracking-wide">
                            All Categories ({filtered.length})
                        </h2>
                        <p className="text-xs text-slate-400">
                            Manage game titles, upload logos, and associate boosting services
                        </p>
                    </div>
                    {filtered.length > 0 && (
                        <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                            Showing <strong className="text-white">{startIndex + 1}–{endIndex}</strong> of <strong className="text-white">{filtered.length}</strong>
                            {totalPages > 1 && (
                                <span className="ml-1.5 text-[#9d7cff] font-bold">
                                    (Pg {safePage}/{totalPages})
                                </span>
                            )}
                        </span>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Icon name="gamepad" className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                        <p className="font-bold text-white mb-1">No categories found</p>
                        <p className="text-sm">
                            {search
                                ? `No results match "${search}"`
                                : 'No categories created yet. Click "New Category" to add one.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {paginatedCategories.map((cat) => (
                            <div
                                key={cat.id || cat.name}
                                className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                            >
                                {/* Left: Logo & Info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-2 shrink-0 overflow-hidden relative">
                                        {cat.image_url ? (
                                            <img
                                                src={cat.image_url}
                                                alt={cat.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <GameLogo name={cat.name} className="scale-75" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-white text-base truncate">
                                                {cat.name}
                                            </h3>
                                            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                                                {cat.mode === 'multiplayer'
                                                    ? 'Multiplayer'
                                                    : cat.mode === 'singleplayer'
                                                    ? 'Singleplayer'
                                                    : 'Multi + Single'}
                                            </span>
                                            {cat.image_url ? (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#9d7cff]/20 text-[#9d7cff] border border-[#9d7cff]/30">
                                                    Custom Image
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                                    Vector Logo
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-400 flex items-center gap-3">
                                            <span>
                                                <strong className="text-white">
                                                    {cat.product_count || 0}
                                                </strong>{' '}
                                                services
                                            </span>
                                            <span>•</span>
                                            <Link
                                                href={`/admin/products?game=${encodeURIComponent(
                                                    cat.name
                                                )}`}
                                                className="text-[#9d7cff] hover:text-white transition-colors"
                                            >
                                                Manage services →
                                            </Link>
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(cat)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#9d7cff]/40 text-[#9d7cff] hover:bg-[#9d7cff] hover:text-[#0d0914] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        <Icon name="edit" className="w-3.5 h-3.5" />
                                        <span>Edit Logo & Info</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            isDeleting && deletingName === cat.name
                                        }
                                        onClick={() => handleDelete(cat)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                        <Icon name="trash" className="w-3.5 h-3.5" />
                                        <span>
                                            {isDeleting && deletingName === cat.name
                                                ? '...'
                                                : 'Delete'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls Footer */}
                {filtered.length > 0 && (
                    <div className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20">
                        <div className="text-xs font-mono text-slate-400">
                            Showing <span className="text-white font-bold">{startIndex + 1}</span> to{' '}
                            <span className="text-white font-bold">{endIndex}</span> of{' '}
                            <span className="text-white font-bold">{filtered.length}</span> categories
                            {totalPages > 1 && (
                                <span className="ml-2 text-slate-500">
                                    (Page <span className="text-[#9d7cff] font-bold">{safePage}</span> of{' '}
                                    <span className="text-white font-bold">{totalPages}</span>)
                                </span>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {/* Previous Page Button */}
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() => handlePageChange(safePage - 1)}
                                    aria-label="Previous page"
                                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <Icon name="chevron-left" className="w-3.5 h-3.5" />
                                    <span>Prev</span>
                                </button>

                                {/* Page Number Pills */}
                                <div className="flex items-center gap-1">
                                    {pageNumbers.map((p, idx) => {
                                        if (p === '...') {
                                            return (
                                                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-slate-500 font-mono">
                                                    …
                                                </span>
                                            );
                                        }
                                        const isCurrent = p === safePage;
                                        return (
                                            <button
                                                key={`page-${p}`}
                                                type="button"
                                                onClick={() => handlePageChange(p)}
                                                aria-label={`Go to page ${p}`}
                                                aria-current={isCurrent ? 'page' : undefined}
                                                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                                                    isCurrent
                                                        ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_2px_10px_rgba(157,124,255,0.4)] font-black'
                                                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Page Button */}
                                <button
                                    type="button"
                                    disabled={safePage >= totalPages}
                                    onClick={() => handlePageChange(safePage + 1)}
                                    aria-label="Next page"
                                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-bold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <span>Next</span>
                                    <Icon name="chevron-right" className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Category Modal */}
            {editingGame && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setEditingGame(null);
                    }}
                >
                    <div
                        className="panel-surface rounded-2xl p-6 sm:p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#171229] border border-white/10 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="eyebrow text-[#9d7cff]">Admin · Category Editor</p>
                                <h3 className="display-font text-2xl uppercase text-white">
                                    Edit {editingGame.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingGame(null)}
                                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor={editNameInputId}
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                                >
                                    Game / Category Name
                                </label>
                                <input
                                    id={editNameInputId}
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor={editModeSelectId}
                                    className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
                                >
                                    Mode
                                </label>
                                <select
                                    id={editModeSelectId}
                                    value={editMode}
                                    onChange={(e) => setEditMode(e.target.value)}
                                    className="w-full bg-[#120e1c] border border-white/10 rounded-lg p-3 text-white focus:border-[#9d7cff] outline-none"
                                >
                                    <option value="both">Multiplayer + Singleplayer</option>
                                    <option value="multiplayer">Multiplayer</option>
                                    <option value="singleplayer">Singleplayer</option>
                                </select>
                            </div>

                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <ImageUploadField
                                    label="Category Logo (Upload from PC or pick already uploaded)"
                                    value={editImageUrl}
                                    onChange={setEditImageUrl}
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingGame(null)}
                                    disabled={isEditing}
                                    className="flex-1 border border-white/10 text-slate-300 hover:border-white/30 hover:text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="flex-1 bg-[#9d7cff] hover:bg-white disabled:opacity-40 text-[#0d0914] font-black py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm uppercase tracking-wider"
                                >
                                    {isEditing ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

