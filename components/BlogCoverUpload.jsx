'use client';

import { useState, useRef } from 'react';
import {
    LuUpload,
    LuImage,
    LuX,
    LuLoader,
    LuFolderOpen,
    LuCheck,
    LuLink,
    LuRefreshCw,
    LuExternalLink
} from 'react-icons/lu';
import { toast } from '../utils/toast';

export default function BlogCoverUpload({
    value = '',
    onChange,
    label = 'Article Cover Image',
    recommendedText = 'Recommended: 1200×675 or 1920×1080 (16:9 aspect ratio, max 5 MB)'
}) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'gallery' | 'url'
    const [urlInputValue, setUrlInputValue] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleUploadFile = async (file) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image exceeds 5 MB limit.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            if (onChange) {
                onChange(data.url);
            }
            toast.success('Cover image uploaded successfully!');
        } catch (err) {
            toast.error(err.message || 'Error uploading image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUploadFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleUploadFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const fetchGallery = async () => {
        setIsLoadingGallery(true);
        try {
            const res = await fetch('/api/admin/upload');
            const data = await res.json();
            if (res.ok && Array.isArray(data.files)) {
                setGalleryImages(data.files);
            }
        } catch {
            toast.error('Failed to load media gallery');
        } finally {
            setIsLoadingGallery(false);
        }
    };

    const handleSelectMode = (mode) => {
        setUploadMode(mode);
        if (mode === 'gallery' && galleryImages.length === 0) {
            fetchGallery();
        }
    };

    const handleApplyUrl = (e) => {
        e?.preventDefault();
        const trimmed = urlInputValue.trim();
        if (!trimmed) return;
        if (onChange) {
            onChange(trimmed);
        }
        setUrlInputValue('');
        toast.success('Cover image URL applied!');
    };

    const isInternalUpload = value?.startsWith('/uploads/');

    return (
        <div className="w-full space-y-3">
            {/* Header info */}
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                        {label}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">{recommendedText}</p>
                </div>
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange && onChange('')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                    >
                        <LuX className="w-3.5 h-3.5" />
                        <span>Remove Cover</span>
                    </button>
                )}
            </div>

            {/* Hidden Input for PC file selection */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Current Cover Preview Card (when value is present) */}
            {value ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#120e1c] shadow-xl group">
                    <div className="aspect-[16/9] w-full max-h-72 overflow-hidden relative bg-black/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Cover preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect width="400" height="225" fill="%231a1528"/><text x="50%" y="50%" fill="%239d7cff" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">Image failed to load</text></svg>';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0d0914]/80 backdrop-blur-md text-[#9d7cff] border border-white/10">
                                16:9 Cover
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#0d0914]/80 backdrop-blur-md text-emerald-400 border border-white/10">
                                {isInternalUpload ? 'Stored in DB / Cloud' : 'External Web URL'}
                            </span>
                        </div>

                        {/* Bottom Overlay Controls */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-mono text-white/90 truncate drop-shadow">
                                    {value}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 transition-colors"
                                    title="Open full image in new tab"
                                >
                                    <LuExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] text-xs font-bold transition-all shadow-md cursor-pointer"
                                >
                                    <LuRefreshCw className="w-3.5 h-3.5" />
                                    <span>Replace Cover</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Upload Selector & Modals (shown always when no image, or as an alternative) */}
            <div className="rounded-2xl border border-white/10 bg-[#161126] p-4 space-y-4">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <button
                        type="button"
                        onClick={() => handleSelectMode('upload')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            uploadMode === 'upload'
                                ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_2px_10px_rgba(157,124,255,0.3)]'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <LuUpload className="w-3.5 h-3.5" />
                        <span>Upload from PC</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectMode('gallery')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            uploadMode === 'gallery'
                                ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_2px_10px_rgba(157,124,255,0.3)]'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <LuFolderOpen className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSelectMode('url')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            uploadMode === 'url'
                                ? 'bg-[#9d7cff] text-[#0d0914] shadow-[0_2px_10px_rgba(157,124,255,0.3)]'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <LuLink className="w-3.5 h-3.5" />
                        <span>Web URL</span>
                    </button>
                </div>

                {/* TAB 1: Upload from PC / Drag & Drop */}
                {uploadMode === 'upload' && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            isDragOver
                                ? 'border-[#9d7cff] bg-[#9d7cff]/10 scale-[1.01]'
                                : 'border-white/15 bg-black/20 hover:border-[#9d7cff]/50 hover:bg-[#1a142e]'
                        }`}
                    >
                        {isUploading ? (
                            <div className="py-4 space-y-2">
                                <LuLoader className="w-8 h-8 mx-auto text-[#9d7cff] animate-spin" />
                                <p className="text-sm font-bold text-white">Uploading cover image to storage...</p>
                                <p className="text-xs text-slate-400">Saving to database &amp; serverless CDN</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                <div className="w-12 h-12 rounded-xl bg-[#9d7cff]/15 text-[#9d7cff] border border-[#9d7cff]/30 mx-auto flex items-center justify-center">
                                    <LuUpload className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        Click to browse or drag &amp; drop your cover photo
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        PNG, JPG, WEBP, or GIF up to 5 MB • Ideal 16:9 banner
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Media Gallery */}
                {uploadMode === 'gallery' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Select any image previously uploaded to the store:</span>
                            <button
                                type="button"
                                onClick={fetchGallery}
                                className="text-[#9d7cff] hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                            >
                                <LuRefreshCw className="w-3 h-3" />
                                Refresh
                            </button>
                        </div>

                        {isLoadingGallery ? (
                            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                <LuLoader className="w-4 h-4 animate-spin text-[#9d7cff]" />
                                <span>Loading uploaded images...</span>
                            </div>
                        ) : galleryImages.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400 italic bg-black/20 rounded-xl border border-white/5">
                                No previous uploads found. Use the &quot;Upload from PC&quot; tab to upload an image.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-52 overflow-y-auto pr-1">
                                {galleryImages.map((img) => {
                                    const isSelected = value === img.url;
                                    return (
                                        <button
                                            key={img.filename}
                                            type="button"
                                            onClick={() => {
                                                if (onChange) onChange(img.url);
                                                toast.success('Cover image selected from gallery!');
                                            }}
                                            className={`group relative aspect-video rounded-lg border bg-[#120e1c] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                                                isSelected
                                                    ? 'border-[#9d7cff] ring-2 ring-[#9d7cff]/60'
                                                    : 'border-white/10 hover:border-[#9d7cff]/60 hover:scale-105'
                                            }`}
                                            title={img.filename}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img.url}
                                                alt={img.filename}
                                                className="w-full h-full object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9d7cff] text-[#0d0914] flex items-center justify-center shadow">
                                                    <LuCheck className="w-2.5 h-2.5 stroke-[3]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: Web URL input */}
                {uploadMode === 'url' && (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Paste image link, e.g. https://images.unsplash.com/photo-..."
                                value={urlInputValue}
                                onChange={(e) => setUrlInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyUrl();
                                    }
                                }}
                                className="flex-1 bg-[#120e1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#9d7cff] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={handleApplyUrl}
                                className="px-4 py-2.5 rounded-xl bg-[#9d7cff] hover:bg-[#8c67ff] text-[#0d0914] text-xs font-black transition-all cursor-pointer shrink-0"
                            >
                                Set URL
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Supports high-resolution CDN links (Unsplash, Imgur, Discord CDN, AWS S3, etc.)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
